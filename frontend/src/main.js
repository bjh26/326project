import { AppControllerComponent } from "./components/AppControllerComponent/AppControllerComponent.js";
import { TaskRepositoryRemoteService } from "./services/TaskRepositoryRemoteService.js";

// Create an instance of AppControllerComponent
const appController = new AppControllerComponent();

// Render the component in the #app container
const appContainer = document.getElementById("app");
appContainer.appendChild(appController.render());

// Services
const taskRepository = new TaskRepositoryRemoteService();



// // main.js - Main entry point for the application
// import { HomePageScreen } from './pages/HomePage/HomePage.js';

// // Wait for DOM to be fully loaded
// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//         console.log('Initializing application...');
        
//         // Get app container
//         let appContainer = document.getElementById('app');
//         if (!appContainer) {
//             appContainer = document.createElement('div');
//             appContainer.id = 'app';
//             document.body.appendChild(appContainer);
//         }
        
//         // Display loading state
//         appContainer.innerHTML = '<div class="loading">Loading...</div>';

//         // Tell EventHub to load login page
//         dispatchEvent(


//         )
        
//         // Create and render the HomePageScreen
//         const homePageScreen = new HomePageScreen();
//         const renderedHomePage = await homePageScreen.render();
        
//         // Clear and append the new content
//         appContainer.innerHTML = '';
//         appContainer.appendChild(renderedHomePage);
        
//         console.log('Application initialized successfully');
//     } catch (error) {
//         console.error('Error initializing application:', error);
        
//         // Show error message to user
//         const appContainer = document.getElementById('app') || document.body;
//         appContainer.innerHTML = 
//             `<div class="error">Error loading research opportunities. Please try again later. Details: ${error.message}</div>`;
//     }
// });

// // Export module for compatibility with existing code
// window.MainModule = {
//     setupPagination: function() {
//         console.log("Using new component-based architecture, setupPagination is handled by components.");
//     }
// };