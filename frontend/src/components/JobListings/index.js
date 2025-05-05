// Updated JobListings/index.js
import { BaseComponents } from '../BaseComponents.js';
import { EventHub, Events } from '../../lib/EventHub/index.js';

export class JobListingsComponent extends BaseComponents {
  constructor() {
    super();
    this.parent = document.createElement('div');
    this.parent.className = 'job-listings-column';
    this.eventHub = EventHub.getInstance();
    this.posts = [];
    this.currentPage = 1;
    this.postsPerPage = 10;
  }

  render() {
    // Load component CSS
    this.loadCSS('src/components/JobListings', 'style');
    
    this.parent.innerHTML = `
      <div class="job-listings-header">
        <h2>Research Opportunities</h2>
      </div>
      <div class="job-listings">
        <div class="loading">Loading research opportunities...</div>
      </div>
      <div class="job-listings-footer">
        <div class="pagination">
          <button type="button" class="prev-page"><</button>
          <span class="page-number">Page 1 of 1</span>
          <button type="button" class="next-page">></button>
        </div>
      </div>
    `;

    // Subscribe to events
    // This is a key event - it's published after data is fetched
    this.eventHub.subscribe(Events.LoadPostsSuccess, (posts) => {
      // Always normalize the data when receiving it
      this.posts = posts.map(post => this.normalizePostData(post));
      this.renderJobPosts();
    });

    // Handle search results (also normalize the data)
    this.eventHub.subscribe(Events.SearchPostsSuccess, (posts) => {
      this.posts = posts.map(post => this.normalizePostData(post));
      this.renderJobPosts();
    });

    this.eventHub.subscribe(Events.SearchPosts, (searchState) => {
      this.performSearch(searchState);
    });

    // Load posts immediately on component initialization
    this.eventHub.subscribe(Events.LoadPosts, () => {
      this.getAllPosts();
    });

    // Set up pagination handlers
    const prevPageButton = this.parent.querySelector('.prev-page');
    const nextPageButton = this.parent.querySelector('.next-page');

    prevPageButton.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderJobPosts();
      }
    });

    nextPageButton.addEventListener('click', () => {
      const totalPages = Math.ceil(this.posts.length / this.postsPerPage);
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderJobPosts();
      }
    });

    // Initial data load with a slight delay to ensure components are ready
    setTimeout(() => {
      this.eventHub.publish(Events.LoadPosts);
    }, 100);
    
    return this.parent;
  }

  // This method normalizes post data to ensure consistency
  normalizePostData(rawPost) {
    // Create a consistent post structure regardless of source
    return {
      id: rawPost.id || 0,
      title: rawPost.title || 'Untitled Opportunity',
      description: rawPost.description || 'No description available',
      responsibilities: this.ensureArray(rawPost.responsibilities),
      qualificationRequirement: this.ensureArray(rawPost.qualificationRequirement),
      compensation: rawPost.compensation || 'Not specified',
      hiringPeriodStart: this.normalizeHiringPeriod(rawPost.hiringPeriodStart),
      hiringPeriodEnd: this.normalizeHiringPeriod(rawPost.hiringPeriodEnd),
      applicationInstructions: rawPost.applicationInstructions || 'Contact for details',
      deadline: this.normalizeDate(rawPost.deadline),
      contactName: rawPost.contactName || 'Not specified',
      contactEmail: rawPost.contactEmail || 'No email provided',
      postedDate: this.normalizeDate(rawPost.postedDate)
    };
  }

  // Helper methods for data normalization
  ensureArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  normalizeDate(dateValue) {
    if (!dateValue) return new Date();
    
    try {
      return new Date(dateValue);
    } catch (e) {
      return new Date();
    }
  }

  normalizeHiringPeriod(hiringPeriodStart, hiringPeriodEnd) {
    const start = this.normalizeDate(hiringPeriodStart);
    const end = this.normalizeDate(hiringPeriodEnd);

    // If both start and end are valid, return them
    if (start && end) {
      return { start, end };
    }

    // Default fallback if either is missing
    return { 
      start: start || new Date(), 
      end: end || new Date(new Date().setMonth(new Date().getMonth() + 3)) 
    };
  }

  async getAllPosts() {
    try {
      const response = await fetch('/researchPost');
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }
      
      const posts = await response.json();
      
      // Important: Normalize all posts before publishing the event
      const normalizedPosts = posts.map(post => this.normalizePostData(post));
      
      // Publish success event
      this.eventHub.publish(Events.LoadPostsSuccess, normalizedPosts);
      
      return normalizedPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      this.eventHub.publish(Events.LoadPostsFailure, error);
      return [];
    }
  }

  async performSearch(searchState) {
    try {
      const allPosts = await this.getAllPosts();
      
      // Filter by search query
      let filteredPosts = allPosts.filter(post => {
        if (!searchState.query) return true;
        return post.title.toLowerCase().includes(searchState.query.toLowerCase()) || 
               post.description.toLowerCase().includes(searchState.query.toLowerCase()) ||
               post.contactName.toLowerCase().includes(searchState.query.toLowerCase());
      });
      
      // Major filtering, date range filtering, etc. (keep existing implementation)
      // ...
      
      // Sort results
      if (searchState.sortOption === 'latest') {
        filteredPosts.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
      } else if (searchState.sortOption === 'deadline') {
        const today = new Date();
        filteredPosts.sort((a, b) => {
          const timeToDeadlineA = new Date(a.deadline) - today;
          const timeToDeadlineB = new Date(b.deadline) - today;
          return timeToDeadlineA - timeToDeadlineB;
        });
      }
      
      // Ensure data is normalized before publishing
      const normalizedFilteredPosts = filteredPosts.map(post => this.normalizePostData(post));
      
      // Reset to first page on new search
      this.currentPage = 1;
      
      // Update the posts and render
      this.posts = normalizedFilteredPosts;
      this.renderJobPosts();
      
      // Publish search results success
      this.eventHub.publish(Events.SearchPostsSuccess, normalizedFilteredPosts);
    } catch (error) {
      console.error('Error searching posts:', error);
      this.eventHub.publish(Events.SearchPostsFailure, error);
    }
  }

  renderJobPosts() {
    const jobListingsElement = this.parent.querySelector('.job-listings');
    jobListingsElement.innerHTML = '';
    
    if (!this.posts || this.posts.length === 0) {
      jobListingsElement.innerHTML = '<div class="no-results">No research opportunities found matching your criteria.</div>';
      return;
    }
    
    // Pagination logic
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    const endIndex = Math.min(startIndex + this.postsPerPage, this.posts.length);
    const postsToShow = this.posts.slice(startIndex, endIndex);
    
    postsToShow.forEach(post => {
      const jobPostElement = document.createElement('div');
      jobPostElement.className = 'job-post';
      jobPostElement.dataset.postId = post.id;
      
      // Format hiring period for display
      let hiringPeriodText = 'Not specified';
      if (post.hiringPeriodStart && post.hiringPeriodEnd) {
        try {
          const start = post.hiringPeriodStart.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          });
          const end = post.hiringPeriodEnd.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          });
          hiringPeriodText = `${start} - ${end}`;
        } catch (e) {
          console.error('Error formatting dates:', e);
        }
      }
      
      jobPostElement.innerHTML = `
        <div class="job-post-header">
          <h3>${post.title}</h3>
          <i class="far fa-bookmark bookmark-icon"></i>
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
        if (e.target.classList.contains('bookmark-icon')) {
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
      bookmarkIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        bookmarkIcon.classList.toggle('fas');
        bookmarkIcon.classList.toggle('far');
        
        if (bookmarkIcon.classList.contains('fas')) {
          // Save post
          this.eventHub.publish(Events.StorePost, post);
        } else {
          // Remove from saved
          this.eventHub.publish(Events.UnStorePosts, post.id);
        }
      });
      
      jobListingsElement.appendChild(jobPostElement);
    });
    
    // Update pagination
    this.updatePagination();
    
    // If this is the first load, select the first post
    if (postsToShow.length > 0) {
      const firstPost = this.parent.querySelector('.job-post');
      if (firstPost) {
        firstPost.classList.add('active');
        this.eventHub.publish(Events.PostSelected, postsToShow[0]);
      }
    }
  }

  updatePagination() {
    const paginationElement = this.parent.querySelector('.page-number');
    const totalPages = Math.ceil(this.posts.length / this.postsPerPage);
    
    paginationElement.textContent = `Page ${this.currentPage} of ${totalPages || 1}`;
    
    // Enable/disable pagination buttons
    const prevButton = this.parent.querySelector('.prev-page');
    const nextButton = this.parent.querySelector('.next-page');
    
    prevButton.disabled = this.currentPage <= 1;
    nextButton.disabled = this.currentPage >= totalPages;
  }
}