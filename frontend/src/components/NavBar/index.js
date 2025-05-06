import { BaseComponents } from '../BaseComponents.js';
import { EventHub, Events } from '../../lib/EventHub/index.js';
import { LocalDB } from '../../services/LocalDB.js';

export class NavBarComponent extends BaseComponents {
  constructor() {
    super();
    this.parent = document.createElement('header');
    this.eventHub = EventHub.getInstance();
  }

  render() {
    // Load component CSS
    this.loadCSS('components/NavBar', 'style');
    
    this.parent.innerHTML = `
      <div id="logo" class="logo-container">
        <img src="../../src/assets/logo.png" alt="Logo" class="img-fluid">
      </div>
      
      <div class="header-actions">
        <button type="button" id="saved_posts">Saved</button>
        <div class="dropdown profile-dropdown">
          <button type="button" id="profile-button">
            <i class="fa-solid fa-user"></i>
          </button>
          <div class="dropdown-content" id="profile-dropdown-menu">
            <button id="view-profile-btn" class="dropdown-btn">View Profile</button>
            <button id="applied-researches-btn" class="dropdown-btn">Applied Researches</button>
            <button id="settings-btn" class="dropdown-btn">Settings</button>
            <button id="logout-btn" class="dropdown-btn">Log Out</button>
          </div>
        </div>
      </div>
    `;

    // Setup event listeners
    this.#setupEventListeners();
    
    return this.parent;
  }

  #setupEventListeners() {
    const profileButton = this.parent.querySelector('#profile-button');
    const dropdownMenu = this.parent.querySelector('#profile-dropdown-menu');
    const savedButton = this.parent.querySelector('#saved_posts');
    const logoContainer = this.parent.querySelector('#logo');

    // Make logo clickable to return to home page
    logoContainer.addEventListener('click', async () => {
      LocalDB.put("isHomePage", true); // Set isHomePage to true
      this.eventHub.publish(Events.NavigateTo, { page: "home" });
    });
    logoContainer.style.cursor = 'pointer'; // Add pointer cursor to indicate clickability

    // Toggle dropdown visibility
    profileButton.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!profileButton.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });

    // Handle saved posts button click
    savedButton.addEventListener('click', async () => {
      await LocalDB.put("isHomePage", false); // Set isHomePage to false
      this.eventHub.publish(Events.NavigateTo, { page: "savedPosts" });
    });

    // Setup dropdown menu buttons
    this.#setupDropdownButtons();
  }

  async #setupDropdownButtons() {
    // View Profile button
    const viewProfileBtn = this.parent.querySelector('#view-profile-btn');
    viewProfileBtn.addEventListener('click', async () => {
      try {
        // Get current user's email
        const sessionEmail = await LocalDB.get("sessionEmail");
        if (sessionEmail) {
          // Navigate to profile page with edit permissions
          this.eventHub.publish(Events.NavigateTo, { 
            page: "profile", 
            info: { 
              email: sessionEmail, 
              canEdit: true 
            }
          });
        } else {
          console.error("No session email found");
        }
      } catch (error) {
        console.error("Error retrieving session email:", error);
      }
      
      // Close dropdown
      this.parent.querySelector('#profile-dropdown-menu').classList.remove('show');
    });

    // Applied Researches button - Not implemented yet
    const appliedResearchesBtn = this.parent.querySelector('#applied-researches-btn');
    appliedResearchesBtn.addEventListener('click', () => {
      // Show not implemented notification
      this.#showNotification("Applied Researches feature coming soon!");
      
      // Close dropdown
      this.parent.querySelector('#profile-dropdown-menu').classList.remove('show');
    });

    // Settings button - Not implemented yet
    const settingsBtn = this.parent.querySelector('#settings-btn');
    settingsBtn.addEventListener('click', () => {
      // Show not implemented notification
      this.#showNotification("Settings feature coming soon!");
      
      // Close dropdown
      this.parent.querySelector('#profile-dropdown-menu').classList.remove('show');
    });
    
    // Logout button
    const logoutBtn = this.parent.querySelector('#logout-btn');
    logoutBtn.addEventListener('click', async () => {
      try {
        // Show logout notification
        this.#showNotification("Logging out...");
        
        // Clear session information from LocalDB
        await LocalDB.delete("sessionEmail");
        
        // Navigate to login page after short delay
        setTimeout(() => {
          this.eventHub.publish(Events.NavigateTo, { page: "login" });
        }, 500);
      } catch (error) {
        console.error("Error during logout:", error);
      }
      
      // Close dropdown
      this.parent.querySelector('#profile-dropdown-menu').classList.remove('show');
    });
  }
  
  #showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'navbar-notification';
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