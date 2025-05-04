// import { TaskListComponent } from '../TaskListComponent/TaskListComponent.js';
// import { SimpleTaskListViewComponent } from '../SimpleTaskListViewComponent/SimpleTaskListViewComponent.js';
// import { TaskInputComponent } from '../TaskInputComponent/TaskInputComponent.js';
import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';
import { LocalDB } from '../../services/LocalDB.js';

import { ProfilePageControllerComponent } from '../ProfilePageControllerComponent/ProfilePageControllerComponent.js';
import { LoginPageControllerComponent } from '../LoginPageControllerComponent/LoginPageControllerComponent.js';

export class AppControllerComponent {
    #container = null; // private container for the component
    #currentPage = null; // track the current view 
    //   #taskListComponent = null; // Instance of the main task list component
    //   #taskInputComponent = null; // Instance of the task input component
    //   #simpleTaskListViewComponent = null; // Instance of the simple view component
    #hub; // EventHub instance for managing events

    // constructor is called upon loading site for first time
    constructor() {
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

        // check if current page is in IndexedDB, otherwise default to login page
        this.#currentPage = await LocalDB.get("currentPage");
        if (!this.#currentPage) {
            this.#currentPage = "login"; // default to login
            await LocalDB.put("currentPage", "login");
        }

        // load current page into container
        await this.#renderPage(this.#currentPage);

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
        this.#container = document.createElement('div');
        this.#container.classList.add('app-controller');
    }

    async #renderPage(page, info) {
        if (page === "login") {
            this.#hub.publish("NavigateToLoginPage");
            const loginPageComponent = Login
        } else if (page === "home") {
            this.#hub.publish("NavigateToHomePage");
        } else if (page === "profile") {
            let email, canEdit;
            if (!info) { // rendering upon reloading, check for session info in DB
                email = await LocalDB.get("viewingProfile");
                canEdit = await LocalDB.get("canEdit");
                if (!email || !canEdit) {
                    throw new Error(`Invalid request to load profile page (email: ${email}, canEdit: ${canEdit})`);
                }
            } else {
                if (!(email in info) || !(canEdit in info)) {
                    throw new Error(`Invalid request to load profile page (info: ${info})`);
                }
                email = info.email;
                canEdit = info.canEdit;
            }

            const profilePageControllerComponent = new ProfilePageControllerComponent(email, canEdit);
            
            this.#container = profilePageControllerComponent.render();
        } else if (page === "createProfile") {

        } else if (page === "createPost") {

        } else if (page === "") {

        } else {
            throw new Error(`Invalid page: ${page}`);
        }
    }

    #setupEventListeners() {
        this.#hub.subscribe(Events.NavigateTo, data => this.#renderPage(data.page, data.info));
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
