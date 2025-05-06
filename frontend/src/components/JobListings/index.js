import { BaseComponents } from '../BaseComponents.js';
import { EventHub, Events } from '../../lib/EventHub/index.js';
import { LocalDB } from '../../services/LocalDB.js';

export class JobListingsComponent extends BaseComponents {
  constructor() {
    super();
    this.parent = document.createElement('div');
    this.parent.className = 'job-listings-column';
    this.eventHub = EventHub.getInstance();
    this.posts = [];
    this.currentPage = 1;
    this.postsPerPage = 30;
    this.totalPosts = 0;
  }

  render() {
    // Load component CSS
    this.loadCSS('components/JobListings', 'style');
    
    this.parent.innerHTML = `
      <div class="job-listings-header">
        <h2>Research Opportunities</h2>
      </div>
      <div class="job-listings">
        <div class="loading">Loading research opportunities...</div>
      </div>
      <div class="job-listings-footer">
        <div class="pagination">
          <button type="button" class="prev-page" disabled><i class="fas fa-chevron-left"></i></button>
          <div class="page-navigation">
            <span class="current-page">1</span>
            <span class="page-separator">of</span>
            <span class="total-pages">1</span>
            <div class="page-jump">
              <input type="number" min="1" max="1" value="1" class="page-input">
              <button type="button" class="go-btn">Go</button>
            </div>
          </div>
          <button type="button" class="next-page" disabled><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
    `;

    // Set up pagination handlers
    this.setupPaginationControls();

    // Subscribe to events
    this.eventHub.subscribe(Events.LoadPosts, () => {
      this.loadPageData(this.currentPage);
    });

    // Handle search results
    this.eventHub.subscribe(Events.SearchPostsSuccess, (posts) => {
      this.posts = posts;
      this.renderJobPosts();
    });

    this.eventHub.subscribe(Events.SearchPosts, (searchState) => {
      this.performSearch(searchState);
    });
    
    // Initial data load with a slight delay to ensure components are ready
    setTimeout(() => {
      this.eventHub.publish(Events.LoadPosts);
    }, 100);
    
    return this.parent;
  }

  setupPaginationControls() {
    const prevButton = this.parent.querySelector('.prev-page');
    const nextButton = this.parent.querySelector('.next-page');
    const pageInput = this.parent.querySelector('.page-input');
    const goButton = this.parent.querySelector('.go-btn');
    
    prevButton.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadPageData(this.currentPage);
      }
    });
    
    nextButton.addEventListener('click', () => {
      const totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.loadPageData(this.currentPage);
      }
    });
    
    goButton.addEventListener('click', () => {
      const requestedPage = parseInt(pageInput.value);
      const totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
      if (!isNaN(requestedPage) && requestedPage >= 1 && requestedPage <= totalPages) {
        this.currentPage = requestedPage;
        this.loadPageData(this.currentPage);
      } else {
        // Invalid page number
        pageInput.value = this.currentPage;
        // Visual indication of error
        pageInput.classList.add('error');
        setTimeout(() => {
          pageInput.classList.remove('error');
        }, 500);
      }
    });
    
    // Allow Enter key to trigger Go button
    pageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        goButton.click();
      }
    });
  }

  async loadPageData(page) {
    // Show loading indicator
    const jobListingsElement = this.parent.querySelector('.job-listings');
    jobListingsElement.innerHTML = '<div class="loading">Loading research opportunities...</div>';
    
    try {
      // Calculate page start/end indices
      const startIndex = (page - 1) * this.postsPerPage;
      // Fetch posts for this page
      for(let i = 1; i <= Math.min(this.postsPerPage, this.totalPosts); i++) {
        const response = await fetch(`/researchPost/${startIndex + i}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }
        const res = await response.json();
        if (res) {
          this.posts.push(res);
          this.totalPosts++;
        }
      }
      
      
      // Render the posts
      await this.renderJobPosts();
      
      // Update pagination UI
      this.updatePagination();
      
    } catch (error) {
      console.error('Error loading page data:', error);
      const jobListingsElement = this.parent.querySelector('.job-listings');
      jobListingsElement.innerHTML = '<div class="error">Failed to load research opportunities. Please try again.</div>';
    }
  }

  updatePagination() {
    const totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
    
    // Update page display and controls
    const currentPageEl = this.parent.querySelector('.current-page');
    const totalPagesEl = this.parent.querySelector('.total-pages');
    const pageInput = this.parent.querySelector('.page-input');
    const prevButton = this.parent.querySelector('.prev-page');
    const nextButton = this.parent.querySelector('.next-page');
    
    // Update text and input values
    currentPageEl.textContent = this.currentPage;
    totalPagesEl.textContent = totalPages || 1;
    pageInput.value = this.currentPage;
    pageInput.max = totalPages || 1;
    
    // Enable/disable navigation buttons
    prevButton.disabled = this.currentPage <= 1;
    nextButton.disabled = this.currentPage >= totalPages;
    
    // Add visual indication for the buttons
    if (prevButton.disabled) {
      prevButton.classList.add('disabled');
    } else {
      prevButton.classList.remove('disabled');
    }
    
    if (nextButton.disabled) {
      nextButton.classList.add('disabled');
    } else {
      nextButton.classList.remove('disabled');
    }
  }

  async performSearch(searchState) {
    try {
      // Show loading state
      const jobListingsElement = this.parent.querySelector('.job-listings');
      jobListingsElement.innerHTML = '<div class="loading">Searching opportunities...</div>';
      
      // Reset to page 1 for new searches
      this.currentPage = 1;
      
      // We'll make the search request to the backend
      // For now, we'll implement this client-side, but ideally this would be a server endpoint
      const response = await fetch('/researchPost');
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }
      
      const allPosts = await response.json();
      
      // Filter by search query
      let filteredPosts = allPosts.filter(post => {
        if (!searchState.query) return true;
        
        const query = searchState.query.toLowerCase();
        return (
          post.title?.toLowerCase().includes(query) || 
          post.description?.toLowerCase().includes(query) ||
          post.contactName?.toLowerCase().includes(query) ||
          post.contactEmail?.toLowerCase().includes(query)
        );
      });
      
      // Additional filtering (majors, date ranges, etc.)
      if (searchState.filters?.majors?.length > 0) {
        filteredPosts = filteredPosts.filter(post => {
          if (!post.qualificationRequirement) return false;
          
          // Check if any of the selected majors appear in qualifications
          return searchState.filters.majors.some(major => {
            if (Array.isArray(post.qualificationRequirement)) {
              return post.qualificationRequirement.some(qual => 
                qual.toLowerCase().includes(major.toLowerCase())
              );
            } else {
              return post.qualificationRequirement.toLowerCase().includes(major.toLowerCase());
            }
          });
        });
      }
      
      // Date range filtering
      if (searchState.filters?.dateRange?.from || searchState.filters?.dateRange?.to) {
        filteredPosts = filteredPosts.filter(post => {
          if (!post.deadline) return true;
          
          const deadlineDate = new Date(post.deadline);
          let isValid = true;
          
          if (searchState.filters.dateRange.from) {
            const fromDate = new Date(searchState.filters.dateRange.from);
            isValid = isValid && deadlineDate >= fromDate;
          }
          
          if (searchState.filters.dateRange.to) {
            const toDate = new Date(searchState.filters.dateRange.to);
            isValid = isValid && deadlineDate <= toDate;
          }
          
          return isValid;
        });
      }
      
      // Sorting logic
      if (searchState.sortOption === 'latest') {
        filteredPosts.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
      } else if (searchState.sortOption === 'deadline') {
        const today = new Date();
        filteredPosts.sort((a, b) => {
          const deadlineA = new Date(a.deadline || '9999-12-31');
          const deadlineB = new Date(b.deadline || '9999-12-31');
          return deadlineA - deadlineB;
        });
      }
      
      // Store total count and update pagination
      this.totalPosts = filteredPosts.length;
      
      // Get posts for the current page only
      const startIdx = (this.currentPage - 1) * this.postsPerPage;
      const endIdx = Math.min(startIdx + this.postsPerPage, this.totalPosts);
      this.posts = filteredPosts.slice(startIdx, endIdx);
      
      // Render the filtered posts
      await this.renderJobPosts();
      
      // Update pagination
      this.updatePagination();
      
      // Publish search results
      this.eventHub.publish(Events.SearchPostsSuccess, this.posts);
      
    } catch (error) {
      console.error('Error searching posts:', error);
      this.eventHub.publish(Events.SearchPostsFailure, error);
      
      const jobListingsElement = this.parent.querySelector('.job-listings');
      jobListingsElement.innerHTML = '<div class="error">Search failed. Please try again.</div>';
    }
  }

  async renderJobPosts() {
    const jobListingsElement = this.parent.querySelector('.job-listings');
    jobListingsElement.innerHTML = '';
    
    if (!this.posts || this.posts.length === 0) {
      jobListingsElement.innerHTML = '<div class="no-results">No research opportunities found matching your criteria.</div>';
      return;
    }
    
    for (const post of this.posts) {
      const jobPostElement = document.createElement('div');
      jobPostElement.className = 'job-post';
      jobPostElement.dataset.postId = post.id;
      
      // Format hiring period for display
      let hiringPeriodText = 'Not specified';
      if (post.hiringPeriodStart && post.hiringPeriodEnd) {
        try {
          const start = new Date(post.hiringPeriodStart).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          });
          const end = new Date(post.hiringPeriodEnd).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          });
          hiringPeriodText = `${start} - ${end}`;
        } catch (e) {
          console.error('Error formatting dates:', e);
        }
      }
      
      // Check if this post is bookmarked
      const isBookmarked = await LocalDB.isBookmarked(post.id);
      const bookmarkClass = isBookmarked ? 'fas' : 'far';
      
      jobPostElement.innerHTML = `
        <div class="job-post-header">
          <h3>${post.title}</h3>
          <i class="${bookmarkClass} fa-bookmark bookmark-icon"></i>
        </div>
        <div class="job-post-details">
          <p><strong>Contact:</strong> ${post.contactName}</p>
          <p><strong>Compensation:</strong> ${post.compensation}</p>
          <p><strong>Period:</strong> ${hiringPeriodText}</p>
        </div>
      `;
      
      // Add click event listener to select this post
      jobPostElement.addEventListener('click', (e) => {
        // Don't trigger if clicking bookmark icon
        if (e.target.classList.contains('bookmark-icon') || e.target.closest('.bookmark-icon')) {
          return;
        }
        
        // Highlight selected post
        const allPosts = this.parent.querySelectorAll('.job-post');
        allPosts.forEach(p => p.classList.remove('active'));
        jobPostElement.classList.add('active');
        
        // Publish post selected event
        this.eventHub.publish(Events.PostSelected, post);

        if (window.innerWidth <= 769) {
          const modal = document.querySelector('.job-details-modal');
          if (modal) {
            modal.classList.add('show');
          }
        }
      });
      
      // Add bookmark functionality
      const bookmarkIcon = jobPostElement.querySelector('.bookmark-icon');
      bookmarkIcon.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        // Toggle bookmark in database
        const success = await LocalDB.toggleBookmark(post.id);
        
        if (success) {
          // Toggle visual indicator
          bookmarkIcon.classList.toggle('fas');
          bookmarkIcon.classList.toggle('far');
          
          // Show a brief notification
          const notificationText = bookmarkIcon.classList.contains('fas') 
            ? 'Research opportunity saved!' 
            : 'Research opportunity removed from saved items';
          
          this.showNotification(notificationText);
        }
      });
      
      jobListingsElement.appendChild(jobPostElement);
    }
    
    // If this is the first load, select the first post
    if (this.posts.length > 0) {
      const firstPost = this.parent.querySelector('.job-post');
      if (firstPost) {
        firstPost.classList.add('active');
        this.eventHub.publish(Events.PostSelected, this.posts[0]);
      }
    }
  }

  // Add notification method
  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'bookmark-notification';
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}