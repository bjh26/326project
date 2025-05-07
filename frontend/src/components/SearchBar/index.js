import { BaseComponents } from '../BaseComponents.js';
import { EventHub, Events } from '../../lib/EventHub/index.js';
import { umassMajors, umassMajorAbbreviations } from "../../assets/majors.js";
import { LocalDB } from '../../services/LocalDB.js';

export class SearchBarComponent extends BaseComponents {
  constructor() {
    super();
    this.parent = document.createElement('div');
    this.parent.className = 'search-container sticky';
    this.eventHub = EventHub.getInstance();
    this.isInSavedPostsMode = false;
    
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
    
    // Create reverse mapping from abbreviations to full major names for searching
    this.abbrevToMajorMap = new Map();
    for (const [abbrev, major] of Object.entries(umassMajorAbbreviations)) {
      this.abbrevToMajorMap.set(abbrev.toLowerCase(), major);
    }
    
    // Create a mapping from full major names to their abbreviations
    this.majorToAbbrevsMap = new Map();
    for (const [abbrev, major] of Object.entries(umassMajorAbbreviations)) {
      if (!this.majorToAbbrevsMap.has(major)) {
        this.majorToAbbrevsMap.set(major, []);
      }
      this.majorToAbbrevsMap.get(major).push(abbrev);
    }
  }

  async render() {
    // Load component CSS
    this.loadCSS('components/SearchBar', 'style');
    
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

    // Check current page mode without triggering new navigations
    const isHomePage = await LocalDB.get('isHomePage');
    if (isHomePage === false) {
      this.isInSavedPostsMode = true;
      const searchInput = this.parent.querySelector('#search-input');
      if (searchInput) {
        searchInput.placeholder = "Search saved posts...";
      }
    } else {
      this.isInSavedPostsMode = false;
      const searchInput = this.parent.querySelector('#search-input');
      if (searchInput) {
        searchInput.placeholder = "Search all research opportunities...";
      }
    }

    // Listen for real mode changes
    this.eventHub.subscribe('SearchModeChanged', (mode) => {
      if (mode === 'saved') {
        this.isInSavedPostsMode = true;
        const searchInput = this.parent.querySelector('#search-input');
        if (searchInput) {
          searchInput.placeholder = "Search saved posts...";
          // Clear previous search
          searchInput.value = "";
          this.searchState.query = "";
        }
      } else if (mode === 'home') {
        this.isInSavedPostsMode = false;
        const searchInput = this.parent.querySelector('#search-input');
        if (searchInput) {
          searchInput.placeholder = "Search all research opportunities...";
          // Clear previous search
          searchInput.value = "";
          this.searchState.query = "";
        }
      }
    });
    
    return this.parent;
  }

  setupSearchHandlers() {
    const searchInput = this.parent.querySelector('#search-input');
    
    let searchTimeout = null;
    
    searchInput.addEventListener('input', (event) => {
      // Clear any existing timeout to debounce rapid typing
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Set a new timeout
      searchTimeout = setTimeout(() => {
        this.searchState.query = event.target.value.trim();
        
        if (this.isInSavedPostsMode) {
          // Publish event for saved posts search
          this.eventHub.publish('SearchSavedPosts', this.searchState);
        } else {
          // Regular search for all posts
          this.eventHub.publish(Events.SearchPosts, this.searchState);
        }
        
        // Clear the timeout reference
        searchTimeout = null;
      }, 300); // 300ms debounce
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
      
      if (this.isInSavedPostsMode) {
        this.eventHub.publish('SearchSavedPosts', this.searchState);
      } else {
        this.eventHub.publish(Events.SearchPosts, this.searchState);
      }
    });
    
    dateToInput.addEventListener('change', () => {
      this.searchState.filters.dateRange.to = dateToInput.value || null;
      
      if (this.isInSavedPostsMode) {
        this.eventHub.publish('SearchSavedPosts', this.searchState);
      } else {
        this.eventHub.publish(Events.SearchPosts, this.searchState);
      }
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
          
          if (this.isInSavedPostsMode) {
            this.eventHub.publish('SearchSavedPosts', this.searchState);
          } else {
            this.eventHub.publish(Events.SearchPosts, this.searchState);
          }
          
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

  // Helper method to check if major or its abbreviations match the search query
  matchesMajorSearch(major, searchQuery) {
    if (!searchQuery) return true;
    
    // Check if the major name contains the search query
    if (major.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true;
    }
    
    // Check if this is an abbreviation that matches a major
    if (this.abbrevToMajorMap.has(searchQuery.toLowerCase())) {
      return this.abbrevToMajorMap.get(searchQuery.toLowerCase()) === major;
    }
    
    // Check if any of the major's abbreviations match the search query
    const abbrevs = this.majorToAbbrevsMap.get(major) || [];
    return abbrevs.some(abbrev => abbrev.toLowerCase().includes(searchQuery.toLowerCase()));
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
      if (!searchQuery && this.searchState.filters.majors.length === 0) {
        majorResultsContainer.innerHTML = '<div class="major-search-prompt">Type to search for majors</div>';
        return;
      }
      
      // If there are selected majors, always show them
      if (this.searchState.filters.majors.length > 0) {
        const selectedSection = document.createElement('div');
        selectedSection.innerHTML = '<div class="selected-majors-header">Selected majors:</div>';
        majorResultsContainer.appendChild(selectedSection);
        
        this.searchState.filters.majors.forEach(major => {
          const count = majorsMap.get(major) || 0;
          this.addMajorItemToResults(major, count, true, majorResultsContainer);
        });
        
        // If there's no search query, we're done after showing selected majors
        if (!searchQuery) {
          return;
        }
      }
      
      let foundResults = false;
      
      // First check for exact matches to abbreviations
      if (this.abbrevToMajorMap.has(searchQuery)) {
        const fullMajor = this.abbrevToMajorMap.get(searchQuery);
        const count = majorsMap.get(fullMajor) || 0;
        const isChecked = this.searchState.filters.majors.includes(fullMajor);
        this.addMajorItemToResults(fullMajor, count, isChecked, majorResultsContainer);
        foundResults = true;
      }
      
      // Then check for partial matches to major names or abbreviations
      majorsMap.forEach((count, major) => {
        // Skip if this major was already added from abbreviation match
        if (foundResults && major === this.abbrevToMajorMap.get(searchQuery)) {
          return;
        }
        
        if (this.matchesMajorSearch(major, searchQuery)) {
          foundResults = true;
          const isChecked = this.searchState.filters.majors.includes(major);
          this.addMajorItemToResults(major, count, isChecked, majorResultsContainer);
        }
      });
      
      if (!foundResults && searchQuery) {
        majorResultsContainer.innerHTML = '<div class="no-results">No majors found matching your search.</div>';
      }
    } catch (error) {
      console.error('Error fetching majors:', error);
    }
  }

  addMajorItemToResults(major, count, isChecked, container) {
    const majorElement = document.createElement('div');
    majorElement.className = 'major-item';
    
    // Simple display with just the major name
    majorElement.innerHTML = `
      <label class="major-label">
        <span>${major}</span>
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
      
      if (this.isInSavedPostsMode) {
        this.eventHub.publish('SearchSavedPosts', this.searchState);
      } else {
        this.eventHub.publish(Events.SearchPosts, this.searchState);
      }
      
      this.populateMajorsList(''); // Refresh to show selected items
    });
      
    container.appendChild(majorElement);
  }
}