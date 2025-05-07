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
        <img src="assets/logo.png" alt="Logo" class="img-fluid">
      </div>
      
      <div class="header-actions">
        <button type="button" id="saved_posts">Saved</button>
        <div class="dropdown profile-dropdown">
          <button type="button" id="profile-button">
            <i class="fa-solid fa-user" id="default-profile-icon"></i>
            <img id="profile-picture" class="hidden" alt="Profile Picture">
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
  
    // Load profile picture if available
    this.#loadProfilePicture();
  
    // Setup event listeners
    this.#setupEventListeners();
    
    return this.parent;
  }
  
  async #loadProfilePicture() {
    try {
      let pfp = await LocalDB.get('pfp');
      let mime = await LocalDB.get('mime');
      if ((pfp === undefined || mime === undefined)) {
        const sessionEmail = await LocalDB.get("sessionEmail");
      
        const response = await fetch(`/profile/${sessionEmail}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const profileData = await response.json();
        pfp = profileData.pfp;
        mime = profileData.mime;
        await LocalDB.put('pfp', pfp);
        await LocalDB.put('mime', mime);
      }
      

      const profilePicture = this.parent.querySelector('#profile-picture');
      const defaultIcon = this.parent.querySelector('#default-profile-icon');
      
      // Only show the profile picture if both pfp and mime are non-null
      if (pfp && mime) {
        profilePicture.src = `data:${mime};base64,${pfp}`;
        profilePicture.classList.remove('hidden');
        defaultIcon.classList.add('hidden');
      } else {
        // Ensure the default icon is shown
        profilePicture.classList.add('hidden');
        defaultIcon.classList.remove('hidden');
      }
    } catch (error) {
      console.error("Error loading profile picture:", error);
    }
  }
  

  #setupEventListeners() {
    const profileButton = this.parent.querySelector('#profile-button');
    const dropdownMenu = this.parent.querySelector('#profile-dropdown-menu');
    const savedButton = this.parent.querySelector('#saved_posts');
    const logoContainer = this.parent.querySelector('#logo');

    // Make logo clickable to return to home page
    logoContainer.addEventListener('click', async () => {
      const currentIsHomePage = await LocalDB.get("isHomePage") || false;
      
      // Only take action if we're not already on the home page
      if (!currentIsHomePage) {
        await LocalDB.put("isHomePage", true); // Set isHomePage to true
        
        // Notify search components about the mode change
        this.eventHub.publish('SearchModeChanged', 'home');
        
        // Then navigate
        this.eventHub.publish(Events.NavigateTo, { page: "home" });
      }
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
      const currentIsHomePage = await LocalDB.get("isHomePage") || true;
      
      // Only take action if we're not already on the saved posts page
      if (currentIsHomePage) {
        await LocalDB.put("isHomePage", false); // Set isHomePage to false
        
        // Notify search components about the mode change
        this.eventHub.publish('SearchModeChanged', 'saved');
        
        // Then navigate
        this.eventHub.publish(Events.NavigateTo, { page: "savedPosts" });
      }
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