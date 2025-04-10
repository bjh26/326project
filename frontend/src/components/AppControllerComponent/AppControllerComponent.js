import { TaskListComponent } from '../TaskListComponent/TaskListComponent.js';
import { SimpleTaskListViewComponent } from '../SimpleTaskListViewComponent/SimpleTaskListViewComponent.js';
import { TaskInputComponent } from '../TaskInputComponent/TaskInputComponent.js';
import { EventHub } from '../../eventhub/EventHub.js';

export class AppControllerComponent {
  #container = null; // Private container for the component
  #currentView = 'main'; // Track the current view ('main' or 'edit')
  // #taskListComponent = null; // Instance of the main task list component
  // #taskInputComponent = null; // Instance of the task input component
  // #simpleTaskListViewComponent = null; // Instance of the simple view component
  #hub = null; // EventHub instance for managing events
  #navBarComponent = null; // Instance of the navigation bar component
  #sideColumnComponent = null; // Instance of the side column component
  #mainBodyComponent = null; // Instance of the main body component

  constructor() {
    this.#hub = EventHub.getInstance();
    // this.#taskListComponent = new TaskListComponent();
    // this.#taskInputComponent = new TaskInputComponent();
    // this.#simpleTaskListViewComponent = new SimpleTaskListViewComponent();
    this.#navBarComponent = new NavBarComponent();;
    this.#sideColumnComponent = new SideColumnComponent();
    this.#mainBodyComponent = new MainBodyComponent();
  }

  // Render the AppController component and return the container
  render() {
    this.#createContainer();
    // this.#setupContainerContent();
    // this.#attachEventListeners();

    // start with profile view
    this.#renderProfileView(); // adds navbar, side column, and main body

    return this.#container;
  }

  #renderProfileView() {
    this.#container.appendChild(this.#navBarComponent.render());
    this.#container.appendChild(this.#sideColumnComponent.render());
    this.#container.appendChild(this.#mainBodyComponent.render());
  }

  // Creates the main container element
  #createContainer() {
    this.#container = document.createElement('div');
    this.#container.classList.add('app-controller');
  }

  // Sets up the HTML structure for the container
  #setupContainerContent() {
    this.#container.appendChild(this.#navBarComponent.render());
    this.#container.appendChild(this.#sideColumnComponent.render());
    this.#container.appendChild(this.#mainBodyComponent.render());
  }

  // Attaches the necessary event listeners
  #attachEventListeners() {
    const switchViewBtn = this.#container.querySelector('#switchViewBtn');

    // Event listener for switching views
    switchViewBtn.addEventListener('click', () => {
      this.#toggleView();
    });

    // Subscribe to events from the EventHub to manage switching
    this.#hub.subscribe('SwitchToSimpleView', () => {
      this.#currentView = 'simple';
      this.#renderCurrentView();
    });

    this.#hub.subscribe('SwitchToMainView', () => {
      this.#currentView = 'main';
      this.#renderCurrentView();
    });
  }

  // Toggles the view between main and simple
  #toggleView() {
    if (this.#currentView === 'main') {
      this.#currentView = 'simple';
      this.#hub.publish('SwitchToSimpleView', null);
    } else {
      this.#currentView = 'main';
      this.#hub.publish('SwitchToMainView', null);
    }
  }

  // Renders the current view based on the #currentView state
  #renderCurrentView() {
    const viewContainer = this.#container.querySelector('#viewContainer');
    viewContainer.innerHTML = ''; // Clear existing content

    // Update the button text based on the current view
    const switchViewBtn = this.#container.querySelector('#switchViewBtn');
    switchViewBtn.textContent = this.#currentView === 'main' ? 'Switch to Simple View' : 'Switch to Main View';

    if (this.#currentView === 'main') {
      // Render the main task list view
      viewContainer.appendChild(this.#taskInputComponent.render());
      viewContainer.appendChild(this.#taskListComponent.render());
    } else {
      // Render the simple task list view
      viewContainer.appendChild(this.#simpleTaskListViewComponent.render());      
    }
  }
}
