import { BaseComponent } from '../BaseComponent/BaseComponent.js';
import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';
import { LocalDB } from '../../services/LocalDB.js';

export class SavedPostsComponent extends BaseComponent {
    constructor() {
        super();
        this.parent = document.createElement('div');
        this.parent.className = 'saved-posts-wrapper';
        this.eventHub = EventHub.getInstance();
    }

    render() {
        // Load component CSS
        this.loadCSS('components/SavedPosts', 'style');
        
        this.parent.innerHTML = `
            <div class="saved-posts-header">
                <h2>Saved Research Opportunities</h2>
            </div>
            <div class="saved-posts-container">
                <div class="loading">Loading saved opportunities...</div>
            </div>
        `;
        
        return this.parent;
    }

    async loadSavedPosts() {
        const container = this.parent.querySelector('.saved-posts-container');
        
        try {
            // Get bookmarked post IDs
            const bookmarkedIds = await LocalDB.getBookmarks();
            
            if (bookmarkedIds.length === 0) {
                container.innerHTML = `
                    <div class="no-saved-posts">
                        <p>You don't have any saved research opportunities yet.</p>
                        <p>Browse opportunities and click the bookmark icon to save them for later.</p>
                    </div>
                `;
                return;
            }
            
            // Create array to hold fetched posts
            const savedPosts = [];
            
            // Fetch each post by ID
            for (const id of bookmarkedIds) {
                try {
                    const response = await fetch(`/researchPost/${id}`);
                    if (response.ok) {
                        const post = await response.json();
                        savedPosts.push(post);
                    }
                } catch (error) {
                    console.error(`Error fetching post ${id}:`, error);
                }
            }
            
            // Clear container
            container.innerHTML = '';
            
            // Render each saved post
            savedPosts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'saved-post-card';
                
                // Format dates
                const deadlineDate = post.deadline ? new Date(post.deadline).toLocaleDateString() : 'Not specified';
                const postedDate = post.postedDate ? new Date(post.postedDate).toLocaleDateString() : 'Unknown';
                
                postElement.innerHTML = `
                    <div class="saved-post-header">
                        <h3>${post.title}</h3>
                        <button class="remove-bookmark" data-id="${post.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="saved-post-info">
                        <p><strong>Contact:</strong> ${post.contactName}</p>
                        <p><strong>Deadline:</strong> ${deadlineDate}</p>
                        <p><strong>Posted:</strong> ${postedDate}</p>
                    </div>
                    <div class="saved-post-actions">
                        <button class="view-details-btn" data-id="${post.id}">View Details</button>
                    </div>
                `;
                
                container.appendChild(postElement);
                
                // Add event listeners
                postElement.querySelector('.remove-bookmark').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const postId = e.currentTarget.dataset.id;
                    await LocalDB.toggleBookmark(postId);
                    postElement.classList.add('removing');
                    setTimeout(() => {
                        postElement.remove();
                        
                        // Check if we have no more saved posts
                        if (container.children.length === 0) {
                            container.innerHTML = `
                                <div class="no-saved-posts">
                                    <p>You don't have any saved research opportunities yet.</p>
                                    <p>Browse opportunities and click the bookmark icon to save them for later.</p>
                                </div>
                            `;
                        }
                    }, 300);
                });
                
                postElement.querySelector('.view-details-btn').addEventListener('click', () => {
                    this.showPostDetailsModal(post);
                });
            });
            
        } catch (error) {
            console.error('Error loading saved posts:', error);
            container.innerHTML = '<div class="error">Failed to load saved opportunities. Please try again.</div>';
        }
    }

    showPostDetailsModal(post) {
        // Find or create the modal container
        let modalContainer = document.querySelector('.job-details-modal');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.className = 'job-details-modal';
            document.body.appendChild(modalContainer);
        }
        
        // Calculate days since posting
        const postedDate = new Date(post.postedDate);
        const today = new Date();
        const daysAgo = Math.floor((today - postedDate) / (1000 * 60 * 60 * 24));
        
        // Format the deadline date
        const deadlineDate = new Date(post.deadline).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
        
        // Format hiring period
        let hiringPeriodText = 'Not specified';
        if (post.hiringPeriodStart && post.hiringPeriodEnd) {
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
        }
        
        modalContainer.innerHTML = `
            <div class="job-details-content">
                <button type="button" class="close-modal">&times;</button>
                <div class="job-details-container">
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
                        
                        ${post.responsibilities ? `
                        <h3>Responsibilities</h3>
                        <ul>
                            ${Array.isArray(post.responsibilities) 
                                ? post.responsibilities.map(r => `<li>${r}</li>`).join('') 
                                : `<li>${post.responsibilities}</li>`}
                        </ul>
                        ` : ''}
                        
                        ${post.qualificationRequirement ? `
                        <h3>Qualification Requirements</h3>
                        <ul>
                            ${Array.isArray(post.qualificationRequirement) 
                                ? post.qualificationRequirement.map(q => `<li>${q}</li>`).join('') 
                                : `<li>${post.qualificationRequirement}</li>`}
                        </ul>
                        ` : ''}
                        
                        <h3>Compensation</h3>
                        <p>${post.compensation || 'Not specified'}</p>

                        <h3>Hiring Period</h3>
                        <p>${hiringPeriodText}</p>
                        
                        ${post.applicationInstructions ? `
                        <h3>Application Instructions</h3>
                        <p>${post.applicationInstructions}</p>
                        ` : ''}

                        <h3>Contact Information</h3>
                        <div class="contact-info">
                            <p><strong>${post.contactName || 'Not specified'}</strong></p>
                            ${post.contactEmail ? `<p><strong>Email:</strong> <a href="mailto:${post.contactEmail}">${post.contactEmail}</a></p>` : ''}
                        </div>
                        
                        <div class="action-buttons">
                            <button type="button" class="apply-button">Apply Now</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Display the modal
        modalContainer.classList.add('show');
        
        // Set up close button
        const closeButton = modalContainer.querySelector('.close-modal');
        closeButton.addEventListener('click', () => {
            modalContainer.classList.remove('show');
        });
        
        // Close modal when clicking outside content
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                modalContainer.classList.remove('show');
            }
        });
        
        // Handle apply button
        const applyButton = modalContainer.querySelector('.apply-button');
        applyButton.addEventListener('click', () => {
            // Get the contact email from the post
            const contactEmail = post.contactEmail || '';
            
            // Create an email subject
            const subject = `Application for ${post.title}`;
            
            // Open email client
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}&su=${encodeURIComponent(subject)}`;
            window.open(gmailUrl, '_blank');
        });
    }
}