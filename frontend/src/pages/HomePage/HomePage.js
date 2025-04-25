// /frontend/src/pages/HomePage/index.js
import { BaseComponents } from '../../components/BaseComponents.js';
import { EventHub, Events } from '../../lib/EventHub/index.js';
import { NavBarComponent } from '../../components/NavBar/index.js';
import { SearchBarComponent } from '../../components/SearchBar/index.js';
import { JobListingsComponent } from '../../components/JobListings/index.js';
import { JobDetailsComponent } from '../../components/JobDetails/index.js';
import { postService } from '../../services/PostService.js';

export class HomePageScreen extends BaseComponents {
  constructor() {
    super();
    this.parent = document.createElement('div');
    this.parent.className = 'page-container';
    this.eventHub = EventHub.getInstance();
    
    // Initialize components
    this.navBar = new NavBarComponent();
    this.searchBar = new SearchBarComponent();
    this.jobListings = new JobListingsComponent();
    this.jobDetails = new JobDetailsComponent();
    
    // Initialize services
    this.postService = postService;
    
    // Set up SSE for real-time updates
    this.setupUpdatesListener();
    
    // Setup navigation events
    this.setupNavigationHandlers();
  }

  render() {
    // Add the CSS for this page
    this.loadCSS('src/pages/HomePage', 'HomePage');
    
    // Clear previous content
    this.parent.innerHTML = '';
    
    // Render the navbar and append to parent
    this.parent.appendChild(this.navBar.render());
    
    // Render search bar component and append (assuming SearchBarComponent is modified to be synchronous)
    this.parent.appendChild(this.searchBar.render());
    
    // Create job postings container
    const jobPostingsContainer = document.createElement('div');
    jobPostingsContainer.className = 'job-postings-container';
    
    // Append job listings (left) and job details (right) components
    // Assuming both components are modified to have synchronous render methods
    jobPostingsContainer.appendChild(this.jobListings.render());
    jobPostingsContainer.appendChild(this.jobDetails.render());
    
    this.parent.appendChild(jobPostingsContainer);
    
    return this.parent;
  }

  setupNavigationHandlers() {
    // Handle navigation events
    this.eventHub.subscribe(Events.NavigateTo, (destination) => {
      if (destination === 'savedPosts') {
        this.showSavedPosts();
      }
    });
  }
  
  async showSavedPosts() {
    // Get saved posts
    const savedPosts = this.postService.getSavedPosts();
    
    if (savedPosts.length === 0) {
      this.showNotification('You have no saved research opportunities.');
      return;
    }
    
    // Publish the saved posts to update the UI
    this.eventHub.publish(Events.LoadPostsSuccess, savedPosts);
    
    // Show a notification
    this.showNotification(`Showing ${savedPosts.length} saved research opportunities.`);
  }

  // Other methods remain the same...
  setupUpdatesListener() { /* same implementation */ }
  showNotification(message) { /* same implementation */ }
}