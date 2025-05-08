import { BaseComponents } from '../BaseComponents.js';
import { EventHub, Events } from '../../lib/EventHub/index.js';
import { LocalDB } from '../../services/LocalDB.js';
import { umassMajors, umassMajorAbbreviations } from "../../assets/majors.js";

export class JobListingsComponent extends BaseComponents {
  constructor() {
    super();
    this.parent = document.createElement('div');
    this.parent.className = 'job-listings-column';
    this.eventHub = EventHub.getInstance();
    this.posts = []; // Current page posts
    this.allPosts = null; // Complete dataset for filtering (loaded in background)
    this.currentPage = 1;
    this.postsPerPage = 30;
    this.totalPosts = 0;
    this.isInitialLoad = true;
    this.isLoadingComplete = false;
    this.isLoading = false; // Add a flag to prevent duplicate loads
    
    // Create a mapping from abbreviations to full major names for faster lookups
    this.abbrevToMajorMap = new Map();
    for (const [abbrev, major] of Object.entries(umassMajorAbbreviations)) {
      this.abbrevToMajorMap.set(abbrev.toLowerCase(), major.toLowerCase());
    }
    
    // Create a set of all major names in lowercase for faster lookups
    this.majorNamesLower = new Set(umassMajors.map(major => major.toLowerCase()));
  }

  render() {
    // Load component CSS
    this.loadCSS('components/JobListings', 'style');
    
    this.parent.innerHTML = `
    <div class="job-listings-header">
      <h2>Research Opportunities</h2>
      <button type="button" id="create-post-btn" class="create-post-btn">
        <i class="fas fa-plus"></i> Create Post
      </button>
    </div>
    <div class="job-listings">
      <div class="loading">Loading research opportunities</div>
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

    const createPostBtn = this.parent.querySelector('#create-post-btn');
    createPostBtn.addEventListener('click', () => {
      this.eventHub.publish(Events.NavigateTo, { page: "createPost" });
    });


    // Set up pagination handlers
    this.setupPaginationControls();

    // Subscribe to events
    this.eventHub.subscribe(Events.LoadPosts, () => {
      // Only load posts if we're not already loading
      if (!this.isLoading) {
        this.loadInitialData();
      }
    });

    // Handle search results
    this.eventHub.subscribe(Events.SearchPostsSuccess, (posts) => {
      this.posts = posts;
      this.renderJobPosts();
    });

    this.eventHub.subscribe(Events.SearchPosts, (searchState) => {
      this.performSearch(searchState);
    });
    
    // Listen for bookmark status changes from SavedPosts component
    this.eventHub.subscribe('BookmarkStatusChanged', (data) => {
      // Update the UI for the affected post
      const postElements = this.parent.querySelectorAll(`.job-post[data-post-id="${data.postId}"]`);
      postElements.forEach(postElement => {
        const bookmarkIcon = postElement.querySelector('.bookmark-icon');
        if (bookmarkIcon) {
          if (data.isBookmarked) {
            bookmarkIcon.classList.add('fas');
            bookmarkIcon.classList.remove('far');
          } else {
            bookmarkIcon.classList.remove('fas');
            bookmarkIcon.classList.add('far');
          }
        }
      });
    });
    
    // Initial data load - no delay needed
    if (this.isInitialLoad) {
      this.loadInitialData();
      this.isInitialLoad = false;
    }
    
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

  async loadInitialData() {
    try {
      // Set loading flag to prevent duplicate loads
      if (this.isLoading) return;
      this.isLoading = true;
      
      // Show loading indicator
      const jobListingsElement = this.parent.querySelector('.job-listings');
      jobListingsElement.innerHTML = '<div class="loading">Loading research opportunities</div>';
      
      // 1. First, get just the first page of posts and total count
      const response = await fetch('/researchPost');
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }
      
      const allData = await response.json();
      
      if (!Array.isArray(allData)) {
        throw new Error('Expected array of posts from server');
      }
      
      // Store total posts count
      this.totalPosts = allData.length;
      
      // Make sure we don't have duplicates in posts
      const uniquePostsMap = new Map();
      allData.forEach(post => {
        if (!uniquePostsMap.has(post.id)) {
          // Ensure id is a string to prevent comparison issues
          post.id = String(post.id);
          uniquePostsMap.set(post.id, post);
        }
      });
      
      // Convert map back to array and sort by posted date (most recent first)
      const uniquePosts = Array.from(uniquePostsMap.values())
        .sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
      
      // Get just the first page of posts to show
      const firstPageEnd = Math.min(this.postsPerPage, uniquePosts.length);
      this.posts = uniquePosts.slice(0, firstPageEnd);
      
      // Render the first page immediately
      await this.renderJobPosts();
      
      // Update pagination UI
      this.updatePagination();
      
      // Select first post if there are posts
      if (this.posts.length > 0) {
        const firstPost = this.parent.querySelector('.job-post');
        if (firstPost) {
          firstPost.classList.add('active');
          this.eventHub.publish(Events.PostSelected, this.posts[0]);
        }
      }
      
      // 2. Start loading full dataset for filtering
      this.allPosts = uniquePosts;
      this.isLoadingComplete = true;
      
      // Update search placeholder to indicate all data is ready
      const searchBar = document.querySelector('#search-input');
      if (searchBar) {
        searchBar.placeholder = 'Search all research opportunities...';
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      const jobListingsElement = this.parent.querySelector('.job-listings');
      jobListingsElement.innerHTML = '<div class="error">Failed to load research opportunities. Please try again.</div>';
    } finally {
      // Reset loading flag
      this.isLoading = false;
    }
  }

  async loadPageData(page) {
    try {
      // Set loading flag to prevent duplicate loads
      if (this.isLoading) return;
      this.isLoading = true;
      
      // Calculate page start/end indices
      const startIndex = (page - 1) * this.postsPerPage;
      const endIndex = Math.min(startIndex + this.postsPerPage, this.totalPosts);
      
      // If we have all posts loaded, just slice from them
      if (this.allPosts && this.allPosts.length > 0) {
        this.posts = this.allPosts.slice(startIndex, endIndex);
        await this.renderJobPosts();
        this.updatePagination();
        return;
      }
      
      // Otherwise, we need to fetch from server (this is a fallback)
      // Show loading indicator
      const jobListingsElement = this.parent.querySelector('.job-listings');
      jobListingsElement.innerHTML = '<div class="loading">Loading page data</div>';
      
      const response = await fetch('/researchPost');
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }
      
      const allData = await response.json();
      
      // Make sure we don't have duplicates in posts
      const uniquePostsMap = new Map();
      allData.forEach(post => {
        if (!uniquePostsMap.has(post.id)) {
          // Ensure id is a string to prevent comparison issues
          post.id = String(post.id);
          uniquePostsMap.set(post.id, post);
        }
      });
      
      // Convert map back to array and sort by posted date (most recent first)
      const uniquePosts = Array.from(uniquePostsMap.values())
        .sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
      
      // Store total posts count and all posts
      this.totalPosts = uniquePosts.length;
      this.allPosts = uniquePosts;
      this.isLoadingComplete = true;
      
      // Get the current page of posts
      this.posts = uniquePosts.slice(startIndex, endIndex);
      
      // Render the current page
      await this.renderJobPosts();
      
      // Update pagination UI
      this.updatePagination();
      
    } catch (error) {
      console.error('Error loading page data:', error);
      const jobListingsElement = this.parent.querySelector('.job-listings');
      jobListingsElement.innerHTML = '<div class="error">Failed to load page data. Please try again.</div>';
    } finally {
      // Reset loading flag
      this.isLoading = false;
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
  
  // Helper method to check if a qualification contains a major or its abbreviation
  checkQualificationForMajor(qualification, searchMajor) {
    // Convert to lowercase for case-insensitive comparison
    const qualLower = qualification.toLowerCase();
    const searchMajorLower = searchMajor.toLowerCase();
    
    // Check if qualification contains the full major name
    if (qualLower.includes(searchMajorLower)) {
      return true;
    }
    
    // Find all abbreviations for this major (if any)
    const abbreviations = [];
    for (const [abbrev, major] of this.abbrevToMajorMap.entries()) {
      if (major === searchMajorLower) {
        abbreviations.push(abbrev);
      }
    }
    
    // Check if qualification contains any of the abbreviations
    return abbreviations.some(abbrev => qualLower.includes(abbrev));
  }
  
  // Helper method to check if a post matches a major
  postMatchesMajor(post, searchMajor) {
    if (!post.qualificationRequirement) return false;
    
    // Handle array of qualifications
    if (Array.isArray(post.qualificationRequirement)) {
      return post.qualificationRequirement.some(qual => 
        this.checkQualificationForMajor(qual, searchMajor)
      );
    } 
    // Handle string qualification
    else {
      return this.checkQualificationForMajor(post.qualificationRequirement, searchMajor);
    }
  }

  async performSearch(searchState) {
    try {
      // Set loading flag to prevent duplicate loads
      if (this.isLoading) return;
      this.isLoading = true;
      
      // Show loading state
      const jobListingsElement = this.parent.querySelector('.job-listings');
      jobListingsElement.innerHTML = '<div class="loading">Searching opportunities</div>';
      
      // Reset to page 1 for new searches
      this.currentPage = 1;
      
      // Check if we have the complete dataset for client-side filtering
      if (!this.isLoadingComplete) {
        // Wait for complete data to load if it's not ready
        const response = await fetch('/researchPost');
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }
        
        const allData = await response.json();
        
        // Make sure we don't have duplicates
        const uniquePostsMap = new Map();
        allData.forEach(post => {
          if (!uniquePostsMap.has(post.id)) {
            // Ensure id is a string to prevent comparison issues
            post.id = String(post.id);
            uniquePostsMap.set(post.id, post);
          }
        });
        
        this.allPosts = Array.from(uniquePostsMap.values());
        this.isLoadingComplete = true;
      }
      
      // Now we have all posts, filter based on search criteria
      let filteredPosts = this.allPosts.filter(post => {
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
          // Check if post matches any of the selected majors
          return searchState.filters.majors.some(major => 
            this.postMatchesMajor(post, major)
          );
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
    } finally {
      // Reset loading flag
      this.isLoading = false;
    }
  }

  async renderJobPosts() {
    const jobListingsElement = this.parent.querySelector('.job-listings');
    jobListingsElement.innerHTML = '';
    
    if (!this.posts || this.posts.length === 0) {
      jobListingsElement.innerHTML = '<div class="no-results">No research opportunities found matching your criteria.</div>';
      return;
    }
    
    // Pre-fetch all bookmark statuses at once for better performance
    const bookmarks = await LocalDB.getBookmarks();
    
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
      
      // Check if this post is bookmarked using the pre-fetched bookmarks
      const isBookmarked = bookmarks.includes(String(post.id));
      const bookmarkClass = isBookmarked ? 'fas' : 'far';
      
      jobPostElement.innerHTML = `
        <div class="job-post-header">
          <h3>${post.title}</h3>
          <i class="${bookmarkClass} fa-bookmark bookmark-icon" data-id="${post.id}"></i>
        </div>
        <div class="job-post-details">
          <p><strong>Contact:</strong> ${post.contactName || 'Not specified'}</p>
          <p><strong>Compensation:</strong> ${post.compensation || 'Not specified'}</p>
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
        const postId = bookmarkIcon.dataset.id;
        const success = await LocalDB.toggleBookmark(postId);
        
        if (success) {
          // Toggle visual indicator
          const wasBookmarked = bookmarkIcon.classList.contains('fas');
          
          if (wasBookmarked) {
            bookmarkIcon.classList.remove('fas');
            bookmarkIcon.classList.add('far');
          } else {
            bookmarkIcon.classList.add('fas');
            bookmarkIcon.classList.remove('far');
          }
          
          // Log bookmark status for debugging
          console.log(`Post ${postId} bookmark status: ${!wasBookmarked}`);
          
          // Notify other components about the bookmark change
          this.eventHub.publish('BookmarkStatusChanged', { 
            postId, 
            isBookmarked: !wasBookmarked 
          });
        }
      });
      
      jobListingsElement.appendChild(jobPostElement);
    }
    
    // If this is the first load, select the first post
    if (this.posts.length > 0 && !this.parent.querySelector('.job-post.active')) {
      const firstPost = this.parent.querySelector('.job-post');
      if (firstPost) {
        firstPost.classList.add('active');
        this.eventHub.publish(Events.PostSelected, this.posts[0]);
      }
    }
  }
}