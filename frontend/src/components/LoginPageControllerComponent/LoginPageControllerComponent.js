import { BaseComponent } from "../BaseComponent/BaseComponent.js";
import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';
import { LocalDB } from '../../services/LocalDB.js';

export class LoginPageControllerComponent extends BaseComponent {
    #container;
    #hub;

    constructor() {
        super();
        this.#hub = EventHub.getInstance();
    }

    async render() {
        this.loadCSS("components/LoginPageControllerComponent", "style");
        this.#container = document.createElement("div");
        this.#container.id = "login-container";

        // Load login page skeleton
        this.#loadSkeleton();
        
        // Add event listeners for login form
        this.#addEventListeners();

        return this.#container;
    }

    #loadSkeleton() {
        this.#container.innerHTML = `
            <div class="login-wrapper">
                <h2>Login to Research Connect</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" id="loginButton" class="login-button">Login</button>
                    </div>
                </form>
                <div class="create-account-link">
                    <p>Don't have an account? <button id="createAccountButton" class="link-button">Create an account</button></p>
                </div>
                <div id="loginMessage" class="message"></div>
            </div>
        `;
    }

    #addEventListeners() {
        const loginForm = this.#container.querySelector("#loginForm");
        const createAccountButton = this.#container.querySelector("#createAccountButton");

        // Handle login form submission
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = this.#container.querySelector("#email").value;
            const password = this.#container.querySelector("#password").value;
            
            // Just check if email is in the database NEED TO IMPLEMENT AUTHENTICATION @all
            try {
                const response = await fetch(`/profile/${email}`);
                
                if (response.status === 200) {
                    // Store email in LocalDB as session identifier
                    await LocalDB.put("sessionEmail", email);
                    
                    // Navigate to home page
                    this.#hub.publish(Events.NavigateTo, { page: "home" });
                } else {
                    this.#showMessage("Invalid email or password", "error");
                }
            } catch (error) {
                console.error("Login error:", error);
                this.#showMessage("Failed to login. Please try again.", "error");
            }
        });

        // Handle create account button click
        createAccountButton.addEventListener("click", () => {
            this.#hub.publish(Events.NavigateTo, { page: "createAccount" });
        });
    }

    #showMessage(message, type = "info") {
        const messageElement = this.#container.querySelector("#loginMessage");
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        
        // Clear message after a delay
        setTimeout(() => {
            messageElement.textContent = "";
            messageElement.className = "message";
        }, 5000);
    }
}