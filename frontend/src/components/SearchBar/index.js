// Updated SearchBar/index.js to match Post.js structure
import { BaseComponents } from '../BaseComponents.js';
import { EventHub, Events } from '../../lib/EventHub/index.js';

export class SearchBarComponent extends BaseComponents {
  constructor() {
    super();
    this.parent = document.createElement('div');
    this.parent.className = 'search-container sticky';
    this.eventHub = EventHub.getInstance();
    
    // Search state to track current filters and sort option
    this.searchState = {
      query: '',
      filters: {
        majors: [],
        dateRange: {
          from: null,
          to: null
        }
      },
      sortOption: 'latest'
    };
  }

  render() {
    // Load component CSS
    this.loadCSS('src/components/SearchBar', 'style');
    
    this.parent.innerHTML = `
      <div class="search-wrapper">
        <input type="text" id="search-input" class="search-bar" placeholder="Search...">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path fill="grey" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 119.5 5a4.5 4.5 0 010 9z"/>
        </svg>
      </div>
      <div class="dropdown filter-dropdown">
        <button id="filter-button" type="button" class="search-buttons">Filter</button>
        <div class="dropdown-content" id="filter-dropdown-menu">
          <div class="filter-section">
            <strong>Majors:</strong>
            <div class="major-search-container">
              <input type="text" id="major-search-input" placeholder="Search Majors">
              <div id="major-search-results" class="major-results"></div>
            </div>
          </div>
          <div class="filter-section">
            <strong>Available Date:</strong>
            <div class="date-range-filter">
              <div class="date-input">
                <label for="date-from">From:</label>
                <input type="date" id="date-from">
              </div>
              <div class="date-input">
                <label for="date-to">To:</label>
                <input type="date" id="date-to">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="dropdown sort-dropdown">
        <button id="sort-button" type="button" class="search-buttons">Sort</button>
        <div class="dropdown-content" id="sort-dropdown-menu">
          <form>
            <div class="sort-option">
              <input type="radio" id="sort-latest" name="sort" value="latest" checked>
              <label for="sort-latest">Latest Posts</label>
            </div>
            <div class="sort-option">
              <input type="radio" id="sort-deadline" name="sort" value="deadline">
              <label for="sort-deadline">Closest Application Deadline</label>
            </div>
          </form>
        </div>
      </div>
    `;

    // Set up event listeners
    this.setupSearchHandlers();
    this.setupFilterHandlers();
    this.setupSortHandlers();
    
    return this.parent;
  }

  setupSearchHandlers() {
    const searchInput = this.parent.querySelector('#search-input');
    
    searchInput.addEventListener('input', (event) => {
      this.searchState.query = event.target.value.trim();
      this.eventHub.publish(Events.SearchPosts, this.searchState);
    });
  }

  setupFilterHandlers() {
    // Filter dropdown toggle
    const filterButton = this.parent.querySelector('#filter-button');
    const filterDropdown = this.parent.querySelector('#filter-dropdown-menu');
    
    filterButton.addEventListener('click', (e) => {
      e.stopPropagation();
      filterDropdown.classList.toggle('show');
      
      // Close sort dropdown if open
      this.parent.querySelector('#sort-dropdown-menu').classList.remove('show');
      
      // Populate majors when opening filter dropdown
      if (filterDropdown.classList.contains('show')) {
        this.populateMajorsList();
      }
    });

    // Major search functionality
    const majorSearchInput = this.parent.querySelector('#major-search-input');
    majorSearchInput.addEventListener('input', (event) => {
      this.handleMajorSearch(event);
    });
    
    // Date range filters
    const dateFromInput = this.parent.querySelector('#date-from');
    const dateToInput = this.parent.querySelector('#date-to');
    
    dateFromInput.addEventListener('change', () => {
      this.searchState.filters.dateRange.from = dateFromInput.value || null;
      this.eventHub.publish(Events.SearchPosts, this.searchState);
    });
    
    dateToInput.addEventListener('change', () => {
      this.searchState.filters.dateRange.to = dateToInput.value || null;
      this.eventHub.publish(Events.SearchPosts, this.searchState);
    });

    // Prevent dropdown from closing when clicking inside it
    filterDropdown.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!filterButton.contains(event.target) && !filterDropdown.contains(event.target)) {
        filterDropdown.classList.remove('show');
      }
    });
  }

  setupSortHandlers() {
    const sortButton = this.parent.querySelector('#sort-button');
    const sortDropdown = this.parent.querySelector('#sort-dropdown-menu');
    
    // Toggle dropdown visibility
    sortButton.addEventListener('click', (e) => {
      e.stopPropagation();
      sortDropdown.classList.toggle('show');
      
      // Close filter dropdown if open
      this.parent.querySelector('#filter-dropdown-menu').classList.remove('show');
    });
    
    // Setup sort option change handlers
    const sortRadios = sortDropdown.querySelectorAll('input[type="radio"]');
    sortRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          this.searchState.sortOption = radio.value;
          this.eventHub.publish(Events.SearchPosts, this.searchState);
          sortDropdown.classList.remove('show');
        }
      });
    });

    // Prevent dropdown from closing when clicking inside it
    sortDropdown.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!sortButton.contains(event.target) && !sortDropdown.contains(event.target)) {
        sortDropdown.classList.remove('show');
      }
    });
  }

  async handleMajorSearch(event) {
    const searchQuery = event.target.value.trim().toLowerCase();
    await this.populateMajorsList(searchQuery);
  }

  async populateMajorsList(searchQuery = '') {
    try {
      const response = await fetch('/researchPost/majors/all');
      if (!response.ok) {
        throw new Error(`Failed to fetch majors: ${response.statusText}`);
      }
      
      const majorData = await response.json();
      const majorsMap = new Map(Object.entries(majorData));
      
      const majorResultsContainer = this.parent.querySelector('#major-search-results');
      majorResultsContainer.innerHTML = '';
      
      // If there's no search query and we're not showing selected majors only, display prompt
      if (!searchQuery) {
        // If there are selected majors, show them
        if (this.searchState.filters.majors.length > 0) {
          const selectedSection = document.createElement('div');
          selectedSection.innerHTML = '<div class="selected-majors-header">Selected majors:</div>';
          majorResultsContainer.appendChild(selectedSection);
          
          this.searchState.filters.majors.forEach(major => {
            const count = majorsMap.get(major) || 0;
            this.addMajorItemToResults(major, count, true, majorResultsContainer);
          });
        }
        return;
      }
      
      let foundResults = false;
      
      majorsMap.forEach((count, major) => {
        if (major.toLowerCase().includes(searchQuery.toLowerCase())) {
          foundResults = true;
          const isChecked = this.searchState.filters.majors.includes(major);
          this.addMajorItemToResults(major, count, isChecked, majorResultsContainer);
        }
      });
      
      if (!foundResults) {
        majorResultsContainer.innerHTML = '<div class="no-results">No majors found matching your search.</div>';
      }
    } catch (error) {
      console.error('Error fetching majors:', error);
    }
  }

  addMajorItemToResults(major, count, isChecked, container) {
    const majorElement = document.createElement('div');
    majorElement.className = 'major-item';
    
    majorElement.innerHTML = `
      <label class="major-label">
        <span>${major} (${count})</span>
        <input type="checkbox" class="major-checkbox" value="${major}" ${isChecked ? 'checked' : ''}>
      </label>
    `;
      
      // Add major checkbox change handler
      const checkbox = majorElement.querySelector('.major-checkbox');
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          // Add major to selected filters
          if (!this.searchState.filters.majors.includes(major)) {
            this.searchState.filters.majors.push(major);
          }
        } else {
          // Remove major from selected filters
          this.searchState.filters.majors = this.searchState.filters.majors.filter(m => m !== major);
        }
        
        this.eventHub.publish(Events.SearchPosts, this.searchState);
      });
      
      container.appendChild(majorElement);
    }
  
    showNotification(message) {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = 'update-notification';
      notification.textContent = message;
      
      // Add to document
      document.body.appendChild(notification);
      
      // Animate in
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
      
      // Remove after delay
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 5000);
    }
  }