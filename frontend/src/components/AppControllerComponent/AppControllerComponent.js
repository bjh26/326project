import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';
import { LocalDB } from '../../services/LocalDB.js';

import { ProfilePageControllerComponent } from '../ProfilePageControllerComponent/ProfilePageControllerComponent.js';
import { LoginPageControllerComponent } from '../LoginPageControllerComponent/LoginPageControllerComponent.js';
import { BaseComponent } from '../BaseComponent/BaseComponent.js';
import { CreateAccountControllerComponent } from '../CreateAccountController/CreateAccountController.js';
import { CreatePostPageControllerComponent } from '../CreatePostPageControllerComponent/CreatePostPageControllerComponent.js';
import { HomePage } from '../HomePageControllerComponent/HomePage.js'
import { SavedPostsComponent } from '../SavedPosts/index.js';

export class AppControllerComponent extends BaseComponent {
    #container = null; // private container for the component
    #currentPage = null; // track the current view 
    #hub; // EventHub instance for managing events

    // constructor is called upon loading site for first time
    constructor() {
        super();

        // store EventHub instance for convenience
        this.#hub = EventHub.getInstance();
    }

    // render the AppController component and return the container
    async render() {
        this.#createContainer();

        // check if current page is in IndexedDB, otherwise default to login page
        this.#currentPage = await LocalDB.get("currentPage");
        if (!this.#currentPage) {
            this.#currentPage = "login"; // default to login
            await LocalDB.put("currentPage", "login");
        }

        // load current page into container
        await this.#renderPage(this.#currentPage);

        this.#setupEventListeners();

        return this.#container;
    }

    // creates the main container element
    #createContainer() {
        this.#container = document.createElement("div");
        this.#container.id = "app-controller";
    }

    #cleanupStylesheets() {
        // Get all link elements that were added by BaseComponent.loadCSS
        const componentStylesheets = document.querySelectorAll('link[rel="stylesheet"][data-component-style="true"]');
        
        // Remove each stylesheet
        componentStylesheets.forEach(stylesheet => {
            document.head.removeChild(stylesheet);
        });
        
        console.log(`Cleaned up ${componentStylesheets.length} component stylesheets`);
    }

    async #renderPage(page, info) {
        this.#cleanupStylesheets();
        this.#container.innerHTML = ''; // Clear existing content

        if (page === "login") {
            const loginPageControllerComponent = new LoginPageControllerComponent();
            this.#container.appendChild(await loginPageControllerComponent.render());
        } else if (page === "home" || page === "savedPosts") {
            const HomePageControllerComponent = new HomePage();
            this.#container.appendChild(await HomePageControllerComponent.render());
        } else if (page === "profile") {
            let email, canEdit, refreshed;
            if (!info) { // rendering upon reloading, check for session info in DB
                const requestedProfile = await LocalDB.get("profileData");
                email = requestedProfile.email;
                const myEmail = await LocalDB.get("sessionEmail");
                canEdit = email === myEmail;
                if (!email) {
                    throw new Error(`Invalid request to load profile page (email: ${email}, canEdit: ${canEdit})`);
                }
                refreshed = true;
            } else {
                if (!("email" in info) || !("canEdit" in info)) {
                    throw new Error(`Invalid request to load profile page (info: ${JSON.stringify(info)}`);
                }
                email = info.email;
                canEdit = info.canEdit;
                refreshed = false;
            }

            const profilePageControllerComponent = new ProfilePageControllerComponent(email, canEdit, refreshed);
            
            this.#container.appendChild(await profilePageControllerComponent.render());
        } else if (page === "createAccount") {
            const createAccountControllerComponent = new CreateAccountControllerComponent();
            this.#container.appendChild(await createAccountControllerComponent.render());
        } else if (page === "createPost") {
            const createPostPageControllerComponent = new CreatePostPageControllerComponent();
            this.#container.appendChild(await createPostPageControllerComponent.render());
        } else {
            throw new Error(`Invalid page: ${page}`);
        }
    }

    #setupEventListeners() {
        this.#hub.subscribe(Events.NavigateTo, async (data) => {
            if (!data.page) {
                throw new Error(`Error: invalid navigate request, page is missing from data`);
            }
            await LocalDB.put("currentPage", data.page)
            await this.#renderPage(data.page, data.info);
        });
    }
}
