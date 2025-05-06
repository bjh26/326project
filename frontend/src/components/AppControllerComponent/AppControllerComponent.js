// import { TaskListComponent } from '../TaskListComponent/TaskListComponent.js';
// import { SimpleTaskListViewComponent } from '../SimpleTaskListViewComponent/SimpleTaskListViewComponent.js';
// import { TaskInputComponent } from '../TaskInputComponent/TaskInputComponent.js';
import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';
import { LocalDB } from '../../services/LocalDB.js';

import { ProfilePageControllerComponent } from '../ProfilePageControllerComponent/ProfilePageControllerComponent.js';
import { LoginPageControllerComponent } from '../LoginPageControllerComponent/LoginPageControllerComponent.js';
import { BaseComponent } from '../BaseComponent/BaseComponent.js';
import { CreateAccountControllerComponent } from '../CreateAccountController/CreateAccountController.js';
import { CreatePostPageControllerComponent } from '../CreatePostPageControllerComponent/CreatePostPageControllerComponent.js';
import { HomePage } from '../../pages/HomePage/HomePage.js'
import { SavedPostsComponent } from '../SavedPosts/index.js';

export class AppControllerComponent extends BaseComponent {
    #container = null; // private container for the component
    #currentPage = null; // track the current view 
    //   #taskListComponent = null; // Instance of the main task list component
    //   #taskInputComponent = null; // Instance of the task input component
    //   #simpleTaskListViewComponent = null; // Instance of the simple view component
    #hub; // EventHub instance for managing events

    // constructor is called upon loading site for first time
    constructor() {
        super();

        // store EventHub instance for convenience
        this.#hub = EventHub.getInstance();

        // // check if current page is in IndexedDB, otherwise default to login page
        // this.#currentView = await LocalDB.get("currentPage");
        // if (this.#currentView === undefined) {
        //     this.#currentView = "login"; // default to login
        //     LocalDB.put("currentPage", "login");
        // }




        // this.#taskListComponent = new TaskListComponent();
        // this.#taskInputComponent = new TaskInputComponent();
        // this.#simpleTaskListViewComponent = new SimpleTaskListViewComponent();
    }

    // render the AppController component and return the container
    async render() {
        this.#createContainer();

        // this.#setupContainerContent();

        // check if current page is in IndexedDB, otherwise default to login page
        this.#currentPage = await LocalDB.get("currentPage");
        if (!this.#currentPage) {
            this.#currentPage = "createAccount"; // default to login
            await LocalDB.put("currentPage", "createAccount");
        }

        // load current page into container
        await this.#renderPage(this.#currentPage);
        // await this.#renderPage(this.#currentPage, {email:"nadina@umass.edu", canEdit:true});

        this.#setupEventListeners();

        // this.#setupContainerContent();
        // this.#attachEventListeners();

        // this.#taskInputComponent.render();
        // this.#taskListComponent.render();
        // this.#simpleTaskListViewComponent.render();

        // // Initially render the main view
        // this.#renderCurrentView();

        return this.#container;
    }

    // creates the main container element
    #createContainer() {
        this.#container = document.createElement("div");
        this.#container.id = "app-controller";
    }

    async #renderPage(page, info) {
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
        }
        else {
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

    // // Sets up the HTML structure for the container
    // #setupContainerContent() {
    //     this.#container.innerHTML = `
    //     <div id="viewContainer"></div>
    //     <button id="switchViewBtn">Switch to Simple View</button>
    //     `;
    // }

    // // Attaches the necessary event listeners
    // #attachEventListeners() {
    //     const switchViewBtn = this.#container.querySelector('#switchViewBtn');

    //     // Event listener for switching views
    //     switchViewBtn.addEventListener('click', () => {
    //         this.#toggleView();
    //     });

    //     // Subscribe to events from the EventHub to manage switching
    //     this.#hub.subscribe('SwitchToSimpleView', () => {
    //         this.#currentView = 'simple';
    //         this.#renderCurrentView();
    //     });

    //     this.#hub.subscribe('SwitchToMainView', () => {
    //         this.#currentView = 'main';
    //         this.#renderCurrentView();
    //     });
    // }

    // // Toggles the view between main and simple
    // #toggleView() {
    //     if (this.#currentView === 'main') {
    //         this.#currentView = 'simple';
    //         this.#hub.publish('SwitchToSimpleView', null);
    //     } else {
    //         this.#currentView = 'main';
    //         this.#hub.publish('SwitchToMainView', null);
    //     }
    // }

    // // Renders the current view based on the #currentView state
    // #renderCurrentView() {
    //     const viewContainer = this.#container.querySelector('#viewContainer');
    //     viewContainer.innerHTML = ''; // Clear existing content

    //     // Update the button text based on the current view
    //     const switchViewBtn = this.#container.querySelector('#switchViewBtn');
    //     switchViewBtn.textContent = this.#currentView === 'main' ? 'Switch to Simple View' : 'Switch to Main View';

    //     if (this.#currentView === 'main') {
    //         // Render the main task list view
    //         viewContainer.appendChild(this.#taskInputComponent.render());
    //         viewContainer.appendChild(this.#taskListComponent.render());
    //     } else {
    //         // Render the simple task list view
    //         viewContainer.appendChild(this.#simpleTaskListViewComponent.render());      
    //     }
    // }
}
