import { BaseComponent } from "../BaseComponent/BaseComponent.js";
import { NavBarComponent } from "../NavBar/index.js";
import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';

export class MainProfileComponent extends BaseComponent {
    #hub;
    
    constructor() {
        super();
        this.#hub = EventHub.getInstance();
    }

    render(canEdit) {
        this.loadCSS("components/MainProfileComponent", "style");
        const container = document.createElement("div");
        container.classList.add("main-grid");
        
        // Create and render NavBar component
        const navBar = new NavBarComponent();
        const navBarElement = navBar.render();
        
        // Create the main content
        const mainContent = document.createElement("div");
        mainContent.classList.add("profile-content");
        
        mainContent.innerHTML = canEdit ?
                                `<div id="sideColumn" class="left-column">
                                    <div id="pfp">
                                        <span class="dot"></span>
                                    </div>
                                    <div id="info" class="side-column-text">
                                        <b id="fullName"></b>
                                        <p id="departmentDisplay"></p>
                                        <p id="emailDisplay"></p>
                                    </div>
                                    <div id="bio" class="side-column-text">
                                        <p id="bioDisplay"></p>
                                    </div>
                                    <div id="resume">
                                    </div>
                                    <div class="edit-profile-button-container">
                                        <button id="edit" class="edit-profile-button">Edit Profile</button>
                                    </div>
                                </div>
                                <div id="mainBody" class="right-column">
                                </div>
                            `
                            :
                            `<div id="sideColumn" class="left-column">
                                    <div id="pfp">
                                        <span class="dot"></span>
                                    </div>
                                    <div id="info" class="side-column-text">
                                        <b id="fullName"></b>
                                        <p id="departmentDisplay"></p>
                                        <p id="emailDisplay"></p>
                                    </div>
                                    <div id="bio" class="side-column-text">
                                        <p id="bioDisplay"></p>
                                    </div>
                                </div>
                                <div id="mainBody" class="right-column">
                                </div>
                            `;
        
        // Append both elements to the container
        container.appendChild(navBarElement);
        container.appendChild(mainContent);
        
        return container;
    }
}