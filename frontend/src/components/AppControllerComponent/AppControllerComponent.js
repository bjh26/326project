// import { TaskListComponent } from '../TaskListComponent/TaskListComponent.js';
// import { SimpleTaskListViewComponent } from '../SimpleTaskListViewComponent/SimpleTaskListViewComponent.js';
// import { TaskInputComponent } from '../TaskInputComponent/TaskInputComponent.js';
import { EventHub } from '../../eventhub/EventHub.js';
import { NavBarComponent } from '../NavBarComponent/NavBarComponent.js';
import { SideColumnComponent } from '../SideColumnComponent/SideColumnComponent.js';
import { MainBodyComponent } from '../MainBodyComponent/MainBodyComponent.js';
import { InfoFormComponent } from '../InfoFormComponent/InfoFormComponent.js';
import { NextButtonComponent } from '../NextButtonComponent/NextButtonComponent.js';
import { UploadComponent } from '../UploadComponent/UploadComponent.js';

export class AppControllerComponent {
  #container = null; // Private container for the component
  #currentView = 'profile'; // Track the current view ('profile', 'edit1', 'edit2', or 'edit3')
  // #taskListComponent = null; // Instance of the main task list component
  // #taskInputComponent = null; // Instance of the task input component
  // #simpleTaskListViewComponent = null; // Instance of the simple view component
  #hub = null; // EventHub instance for managing events
  // #navBarComponent = null; // Instance of the navigation bar component
  // #sideColumnComponent = null; // Instance of the side column component
  // #mainBodyComponent = null; // Instance of the main body component

  constructor() {
    this.#hub = EventHub.getInstance();
    // this.#taskListComponent = new TaskListComponent();
    // this.#taskInputComponent = new TaskInputComponent();
    // this.#simpleTaskListViewComponent = new SimpleTaskListViewComponent();
    // this.#navBarComponent = new NavBarComponent(); DOES THIS GO HERE OR AS LOCAL VARIABLE IN METHOD
    // this.#sideColumnComponent = new SideColumnComponent();
    // this.#mainBodyComponent = new MainBodyComponent();
  }

  // Render the AppController component and return the container
  render() {
    this.#createContainer();
    // this.#setupContainerContent();
    // this.#attachEventListeners();

    // render current view
    this.#renderCurrentView();

    return this.#container;
  }

  // Renders the current view based on the #currentView state
  #renderCurrentView() {
    const viewContainer = this.#container;
    viewContainer.innerHTML = ''; // Clear existing content

    // // Update the button text based on the current view
    // const switchViewBtn = this.#container.querySelector('#switchViewBtn');
    // switchViewBtn.textContent = this.#currentView === 'main' ? 'Switch to Simple View' : 'Switch to Main View';

    if (this.#currentView === 'profile') {
      // Render the profile view
      this.#renderProfileView();
    } else if (this.#currentView === 'edit1') {
      this.#renderEdit1View();
    } else if (this.#currentView === 'edit2') {
      this.#renderEdit2View();
    } else if (this.#currentView === 'edit3') {
      this.#renderEdit3View();
    } else {
      throw new Error(`Invalid view: ${this.#currentView}`);
    }
  }

  #renderProfileView() {
    const mainGrid = document.createElement('div');
    mainGrid.classList.add('main-grid');
    
    const navBarComponent = new NavBarComponent();
    const sideColumnComponent = new SideColumnComponent();
    const mainBodyComponent = new MainBodyComponent();

    mainGrid.appendChild(navBarComponent.render());
    mainGrid.appendChild(sideColumnComponent.render());
    mainGrid.appendChild(mainBodyComponent.render());

    this.#container.appendChild(mainGrid);
  }

  #renderEdit1View() {
    const edit1Container = document.createElement('div');
    edit1Container.classList.add('edit1-container');

    const infoFormComponent = new InfoFormComponent();
    const nextButton = new NextButtonComponent();

    edit1Container.appendChild(infoFormComponent.render());
    edit1Container.appendChild(nextButton.render());

    this.#container.appendChild(edit1Container);
  }

  #renderEdit2View() {
    const edit2Container = document.createElement('div');
    edit2Container.classList.add('edit2-container');

    const uploadPfPComponent = new UploadComponent('Profile Picture');
    const uploadResumeComponent = new UploadComponent('Resume');
    const nextButton = new NextButtonComponent();

    edit2Container.appendChild(uploadPfPComponent.render());
    edit2Container.appendChild(uploadResumeComponent.render());
    edit2Container.appendChild(nextButton.render());

    this.#container.appendChild(edit2Container);
  }

  #renderEdit3View() {
    const edit3Container = document.createElement('div');
    edit3Container.classList.add('edit3-container');

    this.#container.appendChild(edit3Container);
  }

  // Creates the main container element
  #createContainer() {
    this.#container = document.createElement('div');
    this.#container.classList.add('app-controller');
  }

  // // Sets up the HTML structure for the container
  // #setupContainerContent() {
  //   this.#container.appendChild(this.#navBarComponent.render());
  //   this.#container.appendChild(this.#sideColumnComponent.render());
  //   this.#container.appendChild(this.#mainBodyComponent.render());
  // }

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

//   // Renders the current view based on the #currentView state
//   #renderCurrentView() {
//     const viewContainer = this.#container.querySelector('#viewContainer');
//     viewContainer.innerHTML = ''; // Clear existing content

//     // Update the button text based on the current view
//     const switchViewBtn = this.#container.querySelector('#switchViewBtn');
//     switchViewBtn.textContent = this.#currentView === 'main' ? 'Switch to Simple View' : 'Switch to Main View';

//     if (this.#currentView === 'main') {
//       // Render the main task list view
//       viewContainer.appendChild(this.#taskInputComponent.render());
//       viewContainer.appendChild(this.#taskListComponent.render());
//     } else {
//       // Render the simple task list view
//       viewContainer.appendChild(this.#simpleTaskListViewComponent.render());      
//     }
//   }
}