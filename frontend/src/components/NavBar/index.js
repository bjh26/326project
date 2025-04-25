// /frontend/src/components/NavBar/index.js
import { BaseComponents } from '../BaseComponents.js';
import { EventHub, Events } from '../../lib/EventHub/index.js';

export class NavBarComponent extends BaseComponents {
  constructor() {
    super();
    this.parent = document.createElement('header');
    this.eventHub = EventHub.getInstance();
  }

  render() {
    // Load component CSS
    this.loadCSS('src/components/NavBar', 'style');
    
    this.parent.innerHTML = `
      <div id="logo">
        <img src="../frontend/src/assets/logo.png" alt="Logo" class="img-fluid">
      </div>
      
      <div class="header-actions">
        <button type="button" id="saved_posts">Saved</button>
        <div class="dropdown profile-dropdown">
          <button type="button" id="profile-button">
            <i class="fa-solid fa-user"></i>
          </button>
          <div class="dropdown-content" id="profile-dropdown-menu">
            <a href="#">View Profile</a>
            <a href="#">Applied Researches</a>
            <a href="#">Settings</a>
            <a href="#">Log Out</a>
          </div>
        </div>
      </div>
    `;

    // Setup event listeners
    const profileButton = this.parent.querySelector('#profile-button');
    const dropdownMenu = this.parent.querySelector('#profile-dropdown-menu');

    profileButton.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!profileButton.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });

    const savedButton = this.parent.querySelector('#saved_posts');
    savedButton.addEventListener('click', () => {
      this.eventHub.publish(Events.NavigateTo, 'savedPosts');
    });

    return this.parent;
  }
}