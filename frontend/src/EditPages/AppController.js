import { DataBase } from "./DataBase.js";

export class AppController {
    pages = {
        main: `
      <div id="container" class="main-grid">
        <div id="navbar" class="top-row">
          <div class="nav-container">
              <input type="button" id="home" value="Home" class="nav-button">
          </div>
          <div class="search-container">
              <input type="text" id="search" placeholder="Search...">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="gray" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 119.5 5a4.5 4.5 0 010 9z"/>
              </svg>
          </div>
          <div class="nav-container">
              <input type="button" id="edit" value="Edit" class="nav-button">
          </div>
      </div>
        <div id="sideColumn" class="left-column">
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
      </div>
    `,
        edit1: `
            <div id="info-form" class="form">
                <h1>Edit Profile</h1>
                <form id="userInfoForm">
                    <label for="firstName">First Name</label> 
                    <input  type="text" id="firstName" class="user-input" required>
                    <label for="lastName">Last Name</label> 
                    <input  type="text" id="lastName" class="user-input" required>
                    <label for="email">UMass Email</label>
                    <div class="email-row">
                        <input type="email" id="email" class="user-input" required readonly>
                        <div class="checkbox-container">
                            <input type="checkbox" id="displayEmail" class="styled-checkbox">
                            <label for="displayEmail" class="non-bold">Display on profile</label>
                        </div>
                    </div>
                    <label for="department">Department</label>
                    <select id = "department" class="user-input">
                        <option value = "Biology">Biology</option>
                        <option value = "Political Science">Political Science</option>
                        <option value = "Computer Science">Computer Science</option>
                    </select>
                    <label for="bio">Bio</label>
                    <textarea id="bio" class="user-input"></textarea>
                </form>
                <div class="form-actions">
                    <div class="button-group">
                        <input type="button" id="save" class="save-button button" value="Save">
                        <span id="saveMessage" class="save-message"></span>
                    </div>
                    <input type="submit" id="next" class="next-button button" value="Next">
                </div>
            </div>
    `,
        edit2: `
            <div id="info-form" class="form">
                <h1>Upload Profile Picture and Resume</h1>
                <div class="upload-container">
                    <div class="upload-group">
                        <label for="profilePicture" class="upload-label">Profile Picture</label>
                        <input type="file" id="profilePicture" class="upload-input" accept="image/*">
                    </div>
                
                    <div class="upload-group">
                        <label for="resumeFile" class="upload-label">Resume</label>
                        <input type="file" id="resumeFile" class="upload-input" accept="application/pdf">
                    </div>
                </div>
                <div class="form-actions">
                    <div class="button-group">
                        <input type="button" id="save" class="save-button button" value="Save">
                        <span id="saveMessage" class="save-message"></span>
                    </div>
                    <input type="submit" id="next" class="next-button button" value="Next">
                </div>
            </div>
    `,
        edit3: `
            <div id="info-form" class="form">
                <h1>Add Research Interests</h1>
                <form id="researchBlockForm" class="form-grid">
                    <div class="grid-row">
                        <div>
                            <label for="title">Title</label> 
                            <input type="text" id="title" class="user-input" required>
                        </div>
                        <div>
                            <label for="link">Link (optional)</label> 
                            <input type="text" id="link" class="user-input">
                        </div>
                        <div>
                            <label for="type">Type</label>
                            <select id="type" class="user-input">
                                <option value="Paper">Paper</option>
                                <option value="Lab">Lab</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="full-row">
                        <label for="description">Description</label> 
                        <textarea id="description" class="user-input description-input" required></textarea>
                        <input type="button" id="addResearch" class="button full-width-button" value="Add">
                    </div>
                </form>
                <div class="research-items-container" id="researchItemsContainer">
                    <!-- Research items will be added here dynamically -->
                </div>
                <div class="form-actions">
                    <div class="button-group">
                        <input type="button" id="save" class="save-button button" value="Save">
                        <span id="saveMessage" class="save-message"></span>
                    </div>
                    <input type="submit" id="finish" class="next-button button" value="Finish">
                </div>
            </div>
    `,
    }

    // Define the page flow sequence
    pageSequence = {
        "main": "edit1",
        "edit1": "edit2",
        "edit2": "edit3", 
        "edit3": "main"
    };

    #document;
    #container;
    #currentPage;
    #profileData = {};

    constructor(document) {
        this.#document = document;
        this.#container = document.getElementById("app");
    }

    async loadPage(page) {
        this.#currentPage = page;
        this.#container.innerHTML = this.pages[page];
        this.loadCSS(`./${page}/styles.css`);
        
        // Load saved data for the current page
        await this.loadSavedData(page);
        
        // After loading the page, add event listeners
        this.setupEventListeners();
    }

    loadCSS(cssPath) {
        const link = this.#document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssPath;
        this.#document.head.appendChild(link);
    }

    async loadDataFromServer(email) {
        const page = "main";
        this.#currentPage = page;
        this.loadCSS(`./${page}/styles.css`);

        const response = await fetch(`/profile/${email}`);
        if (response.status === 404) {
            this.#container.innerHTML = "Profile not found";
        } else {
            this.#profileData = await response.json();
            await this.saveProfileData();
            await this.loadPage(page);
        }
    }

    async loadSavedData(page) {
        try {
            // Load profile data once and store it in the class property
            this.#profileData = await DataBase.get("storage", "profileData") || {
                researchItems: []
            };
            
            // Make sure researchItems exists
            if (!this.#profileData.researchItems) {
                this.#profileData.researchItems = [];
            }
            
            if (page === 'main') {
                // Display profile data for main page
                if (this.#profileData) {
                    const fullNameElement = this.#document.getElementById("fullName");
                    if (fullNameElement) {
                        fullNameElement.textContent = `${this.#profileData.firstName || 'FirstName'} ${this.#profileData.lastName || 'LastName'}`; // default values if name not found
                    }

                    const departmentDisplay = this.#document.getElementById("departmentDisplay");
                    if (departmentDisplay && this.#profileData.department) {
                        departmentDisplay.textContent = this.#profileData.department;
                    }
                    
                    const emailDisplay = this.#document.getElementById("emailDisplay");
                    if (emailDisplay) {
                        if (this.#profileData.displayEmail && this.#profileData.email) {
                            emailDisplay.textContent = this.#profileData.email;
                        } else {
                            // Don't display anything if email is not set to be displayed
                            emailDisplay.textContent = "";
                        }
                    }
                    
                    const bioDisplay = this.#document.getElementById("bioDisplay");
                    if (bioDisplay && this.#profileData.bio) {
                        bioDisplay.textContent = this.#profileData.bio;
                    }
                }

                // Display research items
                if (this.#profileData.researchItems && this.#profileData.researchItems.length > 0) {
                    const mainBody = this.#document.getElementById("mainBody");
                    if (mainBody) {
                        // Clear any existing research elements
                        const existingResearch = mainBody.querySelectorAll(".research-element");
                        existingResearch.forEach(element => element.remove());
                        
                        // Add research items
                        this.#profileData.researchItems.forEach((item, i) => {
                            const researchElement = this.#document.createElement("div");
                            researchElement.id = `research${i+1}`;
                            researchElement.className = "research-element";
                            researchElement.innerHTML = `
                                <h1>${item.title || `Research ${i+1}`}</h1>
                                <p>${item.description || ""}</p>
                                ${item.link ? `<a href="${item.link}" target="_blank">View More</a>` : ""}
                            `;
                            mainBody.appendChild(researchElement);
                        });
                    }
                }
            } else if (page === 'edit1') {
                // Fill form with profile data
                if (this.#profileData) {
                    const firstNameInput = this.#document.getElementById("firstName");
                    const lastNameInput = this.#document.getElementById("lastName");
                    const emailInput = this.#document.getElementById("email");
                    const displayEmailCheckbox = this.#document.getElementById("displayEmail");
                    const departmentSelect = this.#document.getElementById("department");
                    const bioTextarea = this.#document.getElementById("bio");
                    
                    if (firstNameInput && this.#profileData.firstName) {
                        firstNameInput.value = this.#profileData.firstName;
                    }
                    
                    if (lastNameInput && this.#profileData.lastName) {
                        lastNameInput.value = this.#profileData.lastName;
                    }
                    
                    if (emailInput && this.#profileData.email) {
                        emailInput.value = this.#profileData.email;
                    }
                    
                    if (displayEmailCheckbox && this.#profileData.displayEmail !== undefined) {
                        displayEmailCheckbox.checked = this.#profileData.displayEmail;
                    }
                    
                    if (departmentSelect && this.#profileData.department) {
                        departmentSelect.value = this.#profileData.department;
                    }
                    
                    if (bioTextarea && this.#profileData.bio) {
                        bioTextarea.value = this.#profileData.bio;
                    }
                }
            } else if (page === 'edit3') {
                // Render research items in the form
                this.renderResearchItems();
            }
        } catch (error) {
            console.error("Error loading saved data:", error);
        }
    }

    renderResearchItems() {
        const container = this.#document.getElementById("researchItemsContainer");
        if (!container) return;
        
        container.innerHTML = ''; // Clear existing items
        
        if (!this.#profileData.researchItems || this.#profileData.researchItems.length === 0) {
            return; // No items to render
        }
        
        this.#profileData.researchItems.forEach((item, index) => {
            const itemElement = this.#document.createElement("div");
            itemElement.className = "research-item";
            itemElement.innerHTML = `
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                ${item.link ? `<p><strong>Link:</strong> <a href="${item.link}" target="_blank">${item.link}</a></p>` : ''}
                <p><strong>Type:</strong> ${item.type}</p>
                <div class="research-item-actions">
                    <button class="edit-item" data-index="${index}">Edit</button>
                    <button class="delete-item" data-index="${index}">Delete</button>
                </div>
            `;
            container.appendChild(itemElement);
        });
        
        // Add event listeners for edit and delete buttons
        const editButtons = container.querySelectorAll(".edit-item");
        const deleteButtons = container.querySelectorAll(".delete-item");
        
        editButtons.forEach(button => {
            button.addEventListener("click", () => {
                const index = parseInt(button.getAttribute("data-index"));
                this.editResearchItem(index);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener("click", () => {
                const index = parseInt(button.getAttribute("data-index"));
                this.deleteResearchItem(index);
            });
        });
    }

    editResearchItem(index) {
        const item = this.#profileData.researchItems[index];
        if (!item) return;
        
        // Populate form with item data
        const titleInput = this.#document.getElementById("title");
        const linkInput = this.#document.getElementById("link");
        const typeSelect = this.#document.getElementById("type");
        const descriptionTextarea = this.#document.getElementById("description");
        const addButton = this.#document.getElementById("addResearch");
        
        if (titleInput) titleInput.value = item.title || '';
        if (linkInput) linkInput.value = item.link || '';
        if (typeSelect) typeSelect.value = item.type || 'Paper';
        if (descriptionTextarea) descriptionTextarea.value = item.description || '';
        
        // Change button text and add data attribute
        if (addButton) {
            addButton.value = "Update";
            addButton.setAttribute("data-edit-index", index);
        }
    }

    deleteResearchItem(index) {
        this.#profileData.researchItems.splice(index, 1);
        this.renderResearchItems();
        this.saveProfileData();
        this.showSaveMessage("Research item deleted");
    }

    async saveProfileData() {
        // If we're on the edit1 page, update the basic profile info
        if (this.#currentPage === 'edit1') {
            const firstName = this.#document.getElementById("firstName")?.value;
            const lastName = this.#document.getElementById("lastName")?.value;
            const email = this.#document.getElementById("email")?.value;
            const displayEmail = this.#document.getElementById("displayEmail")?.checked;
            const department = this.#document.getElementById("department")?.value;
            const bio = this.#document.getElementById("bio")?.value;
            
            // Update profile data with new values
            this.#profileData = {
                ...this.#profileData, // Keep existing data, including research items
                firstName,
                lastName,
                email,
                displayEmail,
                department,
                bio
            };
            
            this.showSaveMessage("Profile information saved");
        }
        
        // Save the updated profile data to IndexedDB
        await DataBase.put("storage", { 
            type: "profileData", 
            ...this.#profileData
        });
    }

    showSaveMessage(message) {
        const saveMessageElement = this.#document.getElementById("saveMessage");
        if (saveMessageElement) {
            saveMessageElement.textContent = message;
            saveMessageElement.classList.add("show");
            
            // Hide the message after a few seconds
            setTimeout(() => {
                saveMessageElement.classList.remove("show");
            }, 3000);
        }
    }

    async saveCurrentPageData() {
        // Save different data depending on the current page
        if (this.#currentPage === 'edit1') {
            await this.saveProfileData();
        } else if (this.#currentPage === 'edit3') {
            // This is already handled by add/edit/delete research item functions
            await this.saveProfileData();
        } else if (this.#currentPage === 'edit2') {
            // For edit2, we're not implementing file upload functionality
            this.showSaveMessage("Profile picture and resume settings saved");
        }
    }

    async saveAllDataToServer() { // new for milestone 6, use fetch to POST user's profile data 
        try {
            // load from IndexedDB
            this.#profileData = await DataBase.get("storage", "profileData") || {
                researchItems: []
            };
            
            // Make sure researchItems exists
            if (!this.#profileData.researchItems) {
                this.#profileData.researchItems = [];
            }

            console.log("saving all data to server");
            console.log("here is the data:");
            console.log(this.#profileData);

            // upload to server
            await fetch(`/profile/${this.#profileData.email}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify(this.#profileData)
            });

        } catch (error) {
            console.error("Error uploading data:", error);
        }
    }

    setupEventListeners() {
        // Add event listeners for the 'next' button
        const nextButton = this.#document.getElementById("next");
        if (nextButton) {
            nextButton.addEventListener("click", async (event) => {
                event.preventDefault(); // Prevent form submission default behavior
                
                // Save the current page data first
                await this.saveCurrentPageData();
                
                // Then navigate to the next page
                const nextPage = this.pageSequence[this.#currentPage];
                await DataBase.put("storage", { type: "currentPage", title: nextPage });
                this.loadPage(nextPage);
            });
        }

        // Add event listener for the 'edit' button on the main page
        const editButton = this.#document.getElementById("edit");
        if (editButton) {
            editButton.addEventListener("click", async () => {
                await DataBase.put("storage", { type: "currentPage", title: "edit1" });
                this.loadPage("edit1");
            });
        }

        // Add event listener for the 'home' button
        const homeButton = this.#document.getElementById("home");
        if (homeButton) {
            homeButton.addEventListener("click", async () => {
                await DataBase.put("storage", { type: "currentPage", title: "main" });
                this.loadPage("main");
            });
        }

        // Add event listeners for the 'save' buttons
        const saveButton = this.#document.getElementById("save");
        if (saveButton) {
            saveButton.addEventListener("click", async () => {
                console.log("Save button clicked on", this.#currentPage);
                await this.saveCurrentPageData();
            });
        }

        // add event listener for finish button to also save to server
        const finishButton = this.#document.getElementById("finish");
        if (finishButton) {
            finishButton.addEventListener("click", async (event) => {
                event.preventDefault(); // Prevent form submission default behavior
                
                // Save the current page data first
                await this.saveCurrentPageData();
                await this.saveAllDataToServer();
                
                // Then navigate to the next page
                const nextPage = this.pageSequence[this.#currentPage];
                await DataBase.put("storage", { type: "currentPage", title: nextPage });
                this.loadPage(nextPage);
            });
        }

        // Add event listener for the "Add" research button on edit3 page
        const addResearchButton = this.#document.getElementById("addResearch");
        if (addResearchButton) {
            addResearchButton.addEventListener("click", async () => {
                const title = this.#document.getElementById("title")?.value;
                const link = this.#document.getElementById("link")?.value;
                const type = this.#document.getElementById("type")?.value;
                const description = this.#document.getElementById("description")?.value;
                
                if (!title || !description) {
                    this.showSaveMessage("Please fill in the required fields");
                    return;
                }
                
                const editIndex = addResearchButton.getAttribute("data-edit-index");
                
                if (editIndex !== null && editIndex !== undefined) {
                    // Update existing item
                    const index = parseInt(editIndex);
                    this.#profileData.researchItems[index] = { title, link, type, description };
                    addResearchButton.value = "Add";
                    addResearchButton.removeAttribute("data-edit-index");
                    this.showSaveMessage("Research item updated");
                } else {
                    // Add new item
                    if (!this.#profileData.researchItems) {
                        this.#profileData.researchItems = [];
                    }
                    this.#profileData.researchItems.push({ title, link, type, description });
                    this.showSaveMessage("Research item added");
                }
                
                // Clear the form
                this.#document.getElementById("title").value = "";
                this.#document.getElementById("link").value = "";
                this.#document.getElementById("type").value = "Paper";
                this.#document.getElementById("description").value = "";
                
                // Update the display
                this.renderResearchItems();
                
                // Save the profile data (which includes research items)
                await this.saveProfileData();
            });
        }
    }
}