// searchUI.js - Handle UI interactions for the search functionality

// Global state to track current filters and sort option
const searchState = {
    query: '',
    filters: {
        majors: [],
        onCampusOnly: true,
        dateRange: {
            from: null,
            to: null
        }
    },
    sortOption: 'latest'
};

// Initialize search UI
async function initSearchUI() {
    // Initialize search input listener
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearchInput);
    
    // Initialize filter button
    setupFilterDropdown();
    
    // Initialize sort button
    setupSortDropdown();
    
    // Initialize initial search with no query
    await refreshSearch();
}

// Handle search input changes
function handleSearchInput(event) {
    searchState.query = event.target.value.trim();
    refreshSearch();
}

// Setup filter dropdown functionality
function setupFilterDropdown() {
    const filterButton = document.getElementById('filter-button');
    const filterDropdown = document.getElementById('filter-dropdown-menu');
    
    // Expand filter dropdown content
    filterDropdown.innerHTML = `
        <div class="filter-section">
            <strong>Majors:</strong>
            <div class="major-search-container">
                <input type="text" id="major-search-input" placeholder="Search Majors">
                <div id="major-search-results" class="major-results"></div>
            </div>
        </div>
        <div class="filter-section">
            <div class="location-filter">
                <label for="on-campus-checkbox">On-campus Only</label>
                <input type="checkbox" id="on-campus-checkbox" checked>
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
    `;
    
    // Toggle dropdown visibility
    filterButton.addEventListener('click', () => {
        filterDropdown.classList.toggle('show');
        
        // Close sort dropdown if open
        document.getElementById('sort-dropdown-menu').classList.remove('show');
        
        // Populate majors when opening filter dropdown
        if (filterDropdown.classList.contains('show')) {
            populateMajorsList();
        }
    });
    
    // Setup major search functionality
    const majorSearchInput = document.getElementById('major-search-input');
    majorSearchInput.addEventListener('input', handleMajorSearch);
    
    // Setup on-campus checkbox
    const onCampusCheckbox = document.getElementById('on-campus-checkbox');
    onCampusCheckbox.addEventListener('change', () => {
        searchState.filters.onCampusOnly = onCampusCheckbox.checked;
        refreshSearch();
    });
    
    // Setup date range filters
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    
    dateFromInput.addEventListener('change', () => {
        searchState.filters.dateRange.from = dateFromInput.value || null;
        refreshSearch();
    });
    
    dateToInput.addEventListener('change', () => {
        searchState.filters.dateRange.to = dateToInput.value || null;
        refreshSearch();
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

// Setup sort dropdown functionality
function setupSortDropdown() {
    const sortButton = document.getElementById('sort-button');
    const sortDropdown = document.getElementById('sort-dropdown-menu');
    
    // Expand sort dropdown content
    sortDropdown.innerHTML = `
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
    `;
    
    // Toggle dropdown visibility
    sortButton.addEventListener('click', () => {
        sortDropdown.classList.toggle('show');
        
        // Close filter dropdown if open
        document.getElementById('filter-dropdown-menu').classList.remove('show');
    });
    
    // Setup sort option change handlers
    const sortRadios = sortDropdown.querySelectorAll('input[type="radio"]');
    sortRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                searchState.sortOption = radio.value;
                refreshSearch();
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

// Handle major search and populate results
async function handleMajorSearch(event) {
    const searchQuery = event.target.value.trim().toLowerCase();
    await populateMajorsList(searchQuery);
}

// Update the populateMajorsList function in searchUI.js
async function populateMajorsList(searchQuery = '') {
    const majorsMap = await window.SearchModule.getAllMajors();
    const majorResultsContainer = document.getElementById('major-search-results');
    majorResultsContainer.innerHTML = '';
    
    // If there's no search query and we're not showing selected majors only, display prompt
    if (!searchQuery) {
        
        // If there are selected majors, show them
        if (searchState.filters.majors.length > 0) {
            const selectedSection = document.createElement('div');
            selectedSection.innerHTML = '<div class="selected-majors-header">Selected majors:</div>';
            majorResultsContainer.appendChild(selectedSection);
            
            searchState.filters.majors.forEach(major => {
                const count = majorsMap.get(major) || 0;
                addMajorItemToResults(major, count, true, majorResultsContainer);
            });
        }
        return;
    }
    
    let foundResults = false;
    
    majorsMap.forEach((count, major) => {
        if (major.toLowerCase().includes(searchQuery.toLowerCase())) {
            foundResults = true;
            const isChecked = searchState.filters.majors.includes(major);
            addMajorItemToResults(major, count, isChecked, majorResultsContainer);
        }
    });
    
    if (!foundResults) {
        majorResultsContainer.innerHTML = '<div class="no-results">No majors found matching your search.</div>';
    }
}

// Helper function to create major items
function addMajorItemToResults(major, count, isChecked, container) {
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
            if (!searchState.filters.majors.includes(major)) {
                searchState.filters.majors.push(major);
            }
        } else {
            // Remove major from selected filters
            searchState.filters.majors = searchState.filters.majors.filter(m => m !== major);
        }
        
        refreshSearch();
    });
    
    container.appendChild(majorElement);
}

// Refresh search results based on current state
async function refreshSearch() {
    try {
        const results = await window.SearchModule.searchPosts(
            searchState.query,
            searchState.filters,
            searchState.sortOption
        );
        
        window.SearchModule.renderJobPosts(results);
        
        // If there are results, display the first post details
        if (results.length > 0) {
            displayJobDetails(results[0]);
        }
    } catch (error) {
        console.error('Error refreshing search:', error);
    }
}

// Display job details (shared with search.js)
function displayJobDetails(post) {
    const jobDetailsContainer = document.querySelector('.job-details-container');
    
    // Calculate days since posting
    const today = new Date();
    const daysAgo = Math.floor((today - post.postedDate) / (1000 * 60 * 60 * 24));
    
    // Format the deadline date
    const deadlineDate = post.applicationDeadline.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
    
    jobDetailsContainer.innerHTML = `
        <div class="job-details-header">
            <h2>${post.title}</h2>
            <div class="job-meta-info">
                <p>Posted ${daysAgo} days ago</p>
                <p>Application Deadline: ${deadlineDate}</p>
            </div>
        </div>
        <div class="job-full-description">
            <h3>Job Description</h3>
            <p>${post.description}</p>
            
            <h3>Required Majors</h3>
            <ul>
                ${post.major.map(m => `<li>${m}</li>`).join('')}
            </ul>
            
            <h3>Location</h3>
            <p>${post.location}</p>
            
            <h3>Compensation</h3>
            <p>${post.salary}</p>

            <h3>Period</h3>
            <p>${post.period}</p>

            <h3>Contact Information</h3>
            <div class="contact-info">
                <p><strong>${post.professor}:</strong> <a href="mailto:${post.professor.toLowerCase().replace(/\s+/g, '.')}@example.com">${post.professor.toLowerCase().replace(/\s+/g, '.')}@example.com</a></p>
            </div>
        </div>
    `;
}


// Export functions and objects for use in other files
window.SearchUIModule = {
    initSearchUI,
    refreshSearch
};