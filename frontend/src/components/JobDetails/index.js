// Updated JobDetails/index.js
import { BaseComponents } from '../BaseComponents.js';
import { EventHub, Events } from '../../lib/EventHub/index.js';

export class JobDetailsComponent extends BaseComponents {
  constructor() {
    super();
    this.parent = document.createElement('div');
    this.parent.className = 'job-details-column';
    this.eventHub = EventHub.getInstance();
    this.currentPost = null;
  }

  render() {
    // Load component CSS
    this.loadCSS('components/JobDetails', 'style');
    
    this.parent.innerHTML = `
      <div class="job-details-container">
        <div class="select-job-message">Select a research opportunity to view details</div>
      </div>
    `;

    // Subscribe to post selection events
    this.eventHub.subscribe(Events.PostSelected, (post) => {
      this.currentPost = post;
      this.displayJobDetails(post);
    });

    // Listen for modal close
    document.addEventListener('click', (e) => {
      const modal = document.querySelector('.job-details-modal');
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });

    return this.parent;
  }

  displayJobDetails(post) {
    const jobDetailsContainer = this.parent.querySelector('.job-details-container');
    
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
    `;

    // Set up apply button
    const applyButton = jobDetailsContainer.querySelector('.apply-button');
    if (applyButton) {
      applyButton.addEventListener('click', () => {
        this.handleApply(post);
      });
    }

    // For mobile view, create a modal version
    this.createMobileModal(post);
  }

  createMobileModal(post) {
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
    if (post.hiringPeriod && post.hiringPeriodStart && post.hiringPeriodEnd) {
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
    
    // Set up close button
    const closeButton = modalContainer.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
      modalContainer.classList.remove('show');
    });
    
    // Set up apply button in modal
    const applyButton = modalContainer.querySelector('.apply-button');
    if (applyButton) {
      applyButton.addEventListener('click', () => {
        this.handleApply(post);
      });
    }
  }

  handleApply(post) {
    // Get the contact email from the post
    const contactEmail = post.contactEmail || '';
    
    // Create a well-formatted email subject and body
    const subject = `Application for ${post.title}`;
    
    // Create the mailto URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}&su=${encodeURIComponent(subject)}`;
    window.open(gmailUrl, '_blank');
    
    // Log application event
    this.eventHub.publish('ApplicationSubmitted', {
      postId: post.id,
      postTitle: post.title,
      timestamp: new Date()
    });
  }
}