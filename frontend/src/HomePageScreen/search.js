// search.js - Core search functionality

// Initialize the database
let db;
const DB_NAME = 'researchPostsDB';
const STORE_NAME = 'posts';
const DB_VERSION = 1;

// Sample data (to be replaced with actual data from MongoDB later)
const samplePosts = [
    {
        id: 1,
        title: "Software Engineering Research Assistant",
        professor: "Prof. Emily Rodriguez",
        salary: "$15/hour",
        period: "01/15/2024 - 05/30/2024",
        major: ["Computer Science", "Software Engineering"],
        location: "On-campus",
        postedDate: new Date("2024-01-12"),
        applicationDeadline: new Date("2024-02-15"),
        description: "We are seeking a motivated undergraduate student to assist in a cutting-edge software engineering research project."
    },
    {
        id: 2,
        title: "Machine Learning Research Position",
        professor: "Prof. Michael Chang",
        salary: "$18/hour",
        period: "02/01/2024 - 06/15/2024",
        major: ["Computer Science", "Data Science", "Artificial Intelligence"],
        location: "On-campus",
        postedDate: new Date("2024-01-15"),
        applicationDeadline: new Date("2024-02-20"),
        description: "Join our team to work on cutting-edge machine learning algorithms."
    },
    {
        id: 3,
        title: "AI Research Opportunity",
        professor: "Prof. Sarah Johnson",
        salary: "$17/hour",
        period: "01/20/2024 - 05/20/2024",
        major: ["Artificial Intelligence", "Computer Science"],
        location: "Remote",
        postedDate: new Date("2024-01-10"),
        applicationDeadline: new Date("2024-02-10"),
        description: "Help develop AI models for natural language processing."
    },
    {
        id: 4,
        title: "Software Development Research",
        professor: "Prof. David Wilson",
        salary: "$16/hour",
        period: "02/10/2024 - 06/01/2024",
        major: ["Software Engineering", "Computer Engineering"],
        location: "On-campus",
        postedDate: new Date("2024-01-18"),
        applicationDeadline: new Date("2024-02-25"),
        description: "Work on innovative software development methodologies."
    }
];

// Initialize database and load posts
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = (event) => {
            console.error("Database error:", event.target.error);
            reject(event.target.error);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('title', 'title', { unique: false });
                store.createIndex('major', 'major', { unique: false, multiEntry: true });
                store.createIndex('location', 'location', { unique: false });
                store.createIndex('postedDate', 'postedDate', { unique: false });
                store.createIndex('applicationDeadline', 'applicationDeadline', { unique: false });
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Database initialized successfully");
            
            // Check if we need to load sample data
            checkAndLoadSampleData().then(() => {
                resolve(db);
            });
        };
    });
}

// Check if store is empty and load sample data if needed
async function checkAndLoadSampleData() {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();
    
    return new Promise((resolve) => {
        countRequest.onsuccess = () => {
            if (countRequest.result === 0) {
                console.log("Store is empty, loading sample data");
                loadSampleData().then(resolve);
            } else {
                console.log("Store already has data");
                resolve();
            }
        };
    });
}

// Load sample data into IndexedDB
function loadSampleData() {
    return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        samplePosts.forEach(post => {
            store.add(post);
        });
        
        transaction.oncomplete = () => {
            console.log("Sample data loaded successfully");
            resolve();
        };
    });
}

// Fetch all posts from IndexedDB
async function getAllPosts() {
    return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}

// Main search function that applies filters
async function searchPosts(query = '', filters = {}, sortOption = 'latest') {
    const allPosts = await getAllPosts();
    
    // Filter by search query
    let filteredPosts = allPosts.filter(post => {
        if (!query) return true;
        return post.title.toLowerCase().includes(query.toLowerCase()) || 
               post.description.toLowerCase().includes(query.toLowerCase()) ||
               post.professor.toLowerCase().includes(query.toLowerCase());
    });
    
    // Filter by selected majors
    if (filters.majors && filters.majors.length > 0) {
        filteredPosts = filteredPosts.filter(post => {
            return filters.majors.some(major => post.major.includes(major));
        });
    }
    
    // Filter by location
    if (filters.onCampusOnly === true) {
        filteredPosts = filteredPosts.filter(post => post.location === 'On-campus');
    } else if (filters.onCampusOnly === false) {
        // filteredPosts = filteredPosts.filter(post => post.location !== 'On-campus');
        // No need to filter out on-campus posts if the user wants all locations
    }
    
    // Filter by date range
    if (filters.dateRange?.from && filters.dateRange?.to) {
        const fromDate = new Date(filters.dateRange.from);
        const toDate = new Date(filters.dateRange.to);
        
        filteredPosts = filteredPosts.filter(post => {
            // Parse period dates (assuming format MM/DD/YYYY - MM/DD/YYYY)
            const periodDates = post.period.split(' - ');
            const [startMonth, startDay, startYear] = periodDates[0].split('/');
            const [endMonth, endDay, endYear] = periodDates[1].split('/');
            
            const postStartDate = new Date(`${startYear}-${startMonth}-${startDay}`);
            const postEndDate = new Date(`${endYear}-${endMonth}-${endDay}`);
            
            // Check if the post's period overlaps with the selected date range
            return (postStartDate <= toDate && postEndDate >= fromDate);
        });
    }
    
    // Sort results
    if (sortOption === 'latest') {
        filteredPosts.sort((a, b) => b.postedDate - a.postedDate);
    } else if (sortOption === 'deadline') {
        const today = new Date();
        filteredPosts.sort((a, b) => {
            const timeToDeadlineA = a.applicationDeadline - today;
            const timeToDeadlineB = b.applicationDeadline - today;
            return timeToDeadlineA - timeToDeadlineB;
        });
    }
    
    return filteredPosts;
}

// Get all unique majors and their post counts
async function getAllMajors() {
    const allPosts = await getAllPosts();
    const majorMap = new Map();
    
    allPosts.forEach(post => {
        post.major.forEach(major => {
            if (majorMap.has(major)) {
                majorMap.set(major, majorMap.get(major) + 1);
            } else {
                majorMap.set(major, 1);
            }
        });
    });
    
    return majorMap;
}

// Function to render job posts
function renderJobPosts(posts) {
    const jobListingsElement = document.querySelector('.job-listings');
    jobListingsElement.innerHTML = '';
    
    if (posts.length === 0) {
        jobListingsElement.innerHTML = '<div class="no-results">No research opportunities found matching your criteria.</div>';
        return;
    }
    
    posts.forEach(post => {
        const jobPostElement = document.createElement('div');
        jobPostElement.className = 'job-post';
        jobPostElement.dataset.postId = post.id;
        
        jobPostElement.innerHTML = `
            <div class="job-post-header">
                <h3>${post.title}</h3>
                <i class="far fa-bookmark bookmark-icon"></i>
            </div>
            <div class="job-post-details">
                <p>${post.professor}</p>
                <p>${post.salary}</p>
                <p>${post.period}</p>
            </div>
        `;
        
        jobPostElement.addEventListener('click', () => {
            displayJobDetails(post);
        });
        
        jobListingsElement.appendChild(jobPostElement);
    });
    
    // Update pagination
    updatePagination(posts.length);
}

// Display job details in the right column
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

// Update pagination info
function updatePagination(totalPosts) {
    const paginationElement = document.querySelector('.page-number');
    const currentPage = 1; // For now, we'll just show page 1
    const totalPages = Math.ceil(totalPosts / 10); // Assuming 10 posts per page
    
    paginationElement.textContent = `Page ${currentPage} of ${totalPages || 1}`;
}

// Export functions for use in other files
window.SearchModule = {
    initDB,
    getAllPosts,
    searchPosts,
    getAllMajors,
    renderJobPosts
};