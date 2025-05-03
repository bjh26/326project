import { EventHub } from '../../eventhub/EventHub.js';
import { LocalDB } from '../../services/LocalDB.js';
import { Edit1Component } from '../Edit1Component/Edit1Component.js';
import { Edit2Component } from '../Edit2Component/Edit2Component.js';
import { Edit3Component } from '../Edit3Component/Edit2Component.js';
import { MainProfileComponent } from '../MainProfileComponent/MainProfileComponent.js';

export class ProfilePageControllerComponent {
    #container = null; // private container for the component
    #currentProfilePage = null; // track the current page ("main", "edit1", "edit2", "edit3") 
    //   #taskListComponent = null; // Instance of the main task list component
    //   #taskInputComponent = null; // Instance of the task input component
    //   #simpleTaskListViewComponent = null; // Instance of the simple view component
    #hub; // EventHub instance for managing events

    #pageSequence = {
        "main": "edit1",
        "edit1": "edit2",
        "edit2": "edit3", 
        "edit3": "main"
    };

    #email; // email of person whose profile we're viewing
    #canEdit; // whether user has perms to edit this profile

    #profileData;

    // constructor is called upon loading site for first time
    constructor(email, canEdit) {
        // store EventHub instance for convenience
        this.#hub = EventHub.getInstance();
        this.#email = email;
        this.#canEdit = canEdit;
    }

    async render() {
        this.#container = "";

        // check if current page is in IndexedDB, otherwise default to login page
        this.#currentProfilePage = await LocalDB.get("currentProfilePage");
        if (!this.#currentProfilePage) {
            this.#currentProfilePage = "profile"; // default to profile
            LocalDB.put("currentProfilePage", "profile");
        }

        // load profile data from server into IndexedDB
        await this.#loadDataFromServer(this.#email);

        // load skeleton for current page into container
        this.#loadSkeleton(this.#currentProfilePage);

        // populate with information
        this.#populatePage(this.#currentProfilePage);

        // add event listeners to content on current page
        this.#addEventListeners(this.#currentProfilePage);

        return this.#container;
    }

    async #loadDataFromServer(email) {
        const response = await fetch(`/profile/${email}`);
        if (response.status === 404) {
            throw new Error(`Error: profile not found for email ${email}`);
        } else {
            this.#profileData = await response.json();
            await this.#saveToLocalDB();
        }
    }

    async #saveToLocalDB() {
        await LocalDB.put("profileData", this.#profileData);
    }

    async #saveToServer() {
        // load from IndexedDB
        this.#profileData = LocalDB.get("profileData");
        
        // make sure researchItems exists
        if (!this.#profileData.researchItems) {
            this.#profileData.researchItems = [];
        }

        // upload to server
        await fetch(`/profile/${this.#profileData.email}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(this.#profileData)
        });
    }

    #loadSkeleton(page) {
        if (page === "main") {
            const mainProfileComponent = new MainProfileComponent();
            this.#container = mainProfileComponent.render(info.canEdit);
        } else if (page === "edit1") {
            const edit1Component = new Edit1Component();
            this.#container = edit1Component.render();
        } else if (page === "edit2") {
            const edit2Component = new Edit2Component();
            this.#container = edit2Component.render();
        } else if (page === "edit3") {
            const edit3Component = new Edit3Component();
            this.#container = edit3Component.render();
        } else {
            throw new Error(`Invalid page: ${page}`);
        }
    }

    // #renderPage(page, info) {
    //     if (page === "main") {
    //         const mainProfileComponent = new MainProfileComponent();
    //         const grid = mainProfileComponent.render(info.canEdit);

    //         return grid;
    //     } else if (page === "edit1") {
    //         const edit1Component = new Edit1Component();
    //         const form = edit1Component.render();

    //         return form;
    //     } else if (page === "edit2") {
    //         const edit2Component = new Edit2Component();
    //         const form = edit2Component.render();

    //         return form;
    //     } else if (page === "edit3") {
    //         const edit3Component = new Edit3Component();
    //         const form = edit3Component.render();

    //         return form;
    //     } else {
    //         throw new Error(`Invalid page: ${page}`);
    //     }
    // }

    #populatePage(page) {
        if (page === 'main') {
            // display profile data for main page
            if (this.#profileData) {
                const fullNameElement = document.getElementById("fullName");
                if (fullNameElement) {
                    fullNameElement.textContent = `${this.#profileData.firstName || 'FirstName'} ${this.#profileData.lastName || 'LastName'}`; // default values if name not found
                }

                const departmentDisplay = document.getElementById("departmentDisplay");
                if (departmentDisplay && this.#profileData.department) {
                    departmentDisplay.textContent = this.#profileData.department;
                }
                
                const emailDisplay = document.getElementById("emailDisplay");
                if (emailDisplay) {
                    if (this.#profileData.displayEmail && this.#profileData.email) {
                        emailDisplay.textContent = this.#profileData.email;
                    } else {
                        // don't display anything if email is not set to be displayed
                        emailDisplay.textContent = "";
                    }
                }
                
                const bioDisplay = document.getElementById("bioDisplay");
                if (bioDisplay && this.#profileData.bio) {
                    bioDisplay.textContent = this.#profileData.bio;
                }
            }

            // display research items
            if (this.#profileData.researchItems && this.#profileData.researchItems.length > 0) {
                const mainBody = document.getElementById("mainBody");
                if (mainBody) {
                    // clear any existing research elements
                    const existingResearch = mainBody.querySelectorAll(".research-element");
                    existingResearch.forEach(element => element.remove());
                    
                    // add research items
                    this.#profileData.researchItems.forEach((item, i) => {
                        const researchElement = document.createElement("div");
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
            // fill form with profile data
            if (this.#profileData) {
                const firstNameInput = document.getElementById("firstName");
                const lastNameInput = document.getElementById("lastName");
                const emailInput = document.getElementById("email");
                const displayEmailCheckbox = document.getElementById("displayEmail");
                const departmentSelect = document.getElementById("department");
                const bioTextarea = document.getElementById("bio");
                
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
            this.#renderResearchItems();
        }
    }

    #addEventListeners() {
        // add event listeners for the 'next' button
        const nextButton = document.getElementById("next");
        if (nextButton) {
            nextButton.addEventListener("click", async (event) => {
                event.preventDefault(); // prevent form submission default behavior
                
                // save the current page data first
                await this.#saveCurrentPageData();
                
                // then navigate to the next page
                const nextPage = this.#pageSequence[this.#currentProfilePage];
                await LocalDB.put("currentProfilePage", nextPage);
                this.#currentProfilePage = nextPage;


                this.loadPage(nextPage); // ???
            });
        }

        // Add event listener for the 'edit' button on the main page
        const editButton = document.getElementById("edit");
        if (editButton) {
            editButton.addEventListener("click", async () => {
                await LocalDB.put("currentProfilePage", "edit1");
                this.#currentProfilePage = "edit1";
                this.loadPage("edit1"); // ???
            });
        }

        // Add event listener for the 'home' button
        const homeButton = document.getElementById("home");
        if (homeButton) {
            homeButton.addEventListener("click", async () => {
                await LocalDB.put("currentProfilePage", "main");
                this.#currentProfilePage = "main";
                this.loadPage("main"); // ???
            });
        }

        // add event listeners for the 'save' buttons
        const saveButton = document.getElementById("save");
        if (saveButton) {
            saveButton.addEventListener("click", async () => {
                console.log("Save button clicked on", this.#currentProfilePage);
                await this.#saveCurrentPageData();
            });
        }

        // add event listener for finish button to also save to server
        const finishButton = document.getElementById("finish");
        if (finishButton) {
            finishButton.addEventListener("click", async (event) => {
                event.preventDefault(); // prevent form submission default behavior
                
                // Save the current page data first
                await this.#saveCurrentPageData();
                await this.#saveToServer();
                
                // then navigate to the home page
                await LocalDB.put("currentProfilePage", "main");
                this.#currentProfilePage = "main";
                this.loadPage("main"); // ???
            });
        }

        // add event listener for the "Add" research button on edit3 page
        const addResearchButton = document.getElementById("addResearch");
        if (addResearchButton) {
            addResearchButton.addEventListener("click", async () => {
                const title = document.getElementById("title")?.value;
                const link = document.getElementById("link")?.value;
                const type = document.getElementById("type")?.value;
                const description = document.getElementById("description")?.value;
                
                if (!title || !description) {
                    this.#showSaveMessage("Please fill in the required fields");
                    return;
                }
                
                const editIndex = addResearchButton.getAttribute("data-edit-index");
                
                if (editIndex !== null && editIndex !== undefined) {
                    // update existing item
                    const index = parseInt(editIndex);
                    this.#profileData.researchItems[index] = { title, link, type, description };
                    addResearchButton.value = "Add";
                    addResearchButton.removeAttribute("data-edit-index");
                    this.#showSaveMessage("Research item updated");
                } else {
                    // add new item
                    if (!this.#profileData.researchItems) {
                        this.#profileData.researchItems = [];
                    }
                    this.#profileData.researchItems.push({ title, link, type, description });
                    this.#showSaveMessage("Research item added");
                }
                
                // clear the form
                document.getElementById("title").value = "";
                document.getElementById("link").value = "";
                document.getElementById("type").value = "Paper";
                document.getElementById("description").value = "";
                
                // update the display
                this.#renderResearchItems();
                
                // save the profile data (which includes research items)
                await this.#saveProfileData();
            });
        }
    }

    #renderResearchItems() {
        const container = document.getElementById("researchItemsContainer");
        if (!container) return;
        
        container.innerHTML = ''; // clear existing items
        
        if (!this.#profileData.researchItems || this.#profileData.researchItems.length === 0) {
            return; // no items to render
        }
        
        this.#profileData.researchItems.forEach((item, index) => {
            const itemElement = document.createElement("div");
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
        
        // add event listeners for edit and delete buttons
        const editButtons = container.querySelectorAll(".edit-item");
        const deleteButtons = container.querySelectorAll(".delete-item");
        
        editButtons.forEach(button => {
            button.addEventListener("click", () => {
                const index = parseInt(button.getAttribute("data-index"));
                this.#editResearchItem(index);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener("click", () => {
                const index = parseInt(button.getAttribute("data-index"));
                this.#deleteResearchItem(index);
            });
        });
    }

    #editResearchItem(index) {
        const item = this.#profileData.researchItems[index];
        if (!item) return;
        
        // Populate form with item data
        const titleInput = document.getElementById("title");
        const linkInput = document.getElementById("link");
        const typeSelect = document.getElementById("type");
        const descriptionTextarea = document.getElementById("description");
        const addButton = document.getElementById("addResearch");
        
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

    #deleteResearchItem(index) {
        this.#profileData.researchItems.splice(index, 1);
        this.#renderResearchItems();
        this.#saveProfileData();
        this.#showSaveMessage("Research item deleted");
    }

    async #saveCurrentPageData() {
        // Save different data depending on the current page
        if (this.#currentProfilePage === 'edit1') {
            // update this.#profileData and save to IndexedDB
            await this.#saveProfileData();
        } else if (this.#currentProfilePage === 'edit3') {
            // this is already handled by add/edit/delete research item functions
            // so this.#profileData will have already been updated
            // all that's left is to save to IndexedDB
            await this.#saveToLocalDB();
        } else if (this.#currentProfilePage === 'edit2') {
            // TODO: implement uploading files to IndexedDB
            this.#showSaveMessage("Profile picture and resume settings saved");
        }
    }

    async #saveProfileData() {
        // for edit1 page, update the basic profile info
        if (this.#currentProfilePage === 'edit1') {
            const firstName = document.getElementById("firstName")?.value;
            const lastName = document.getElementById("lastName")?.value;
            const email = document.getElementById("email")?.value;
            const displayEmail = document.getElementById("displayEmail")?.checked;
            const department = document.getElementById("department")?.value;
            const bio = document.getElementById("bio")?.value;
            
            // update profile data with new values
            this.#profileData = {
                ...this.#profileData, // keep existing data, including research items
                firstName,
                lastName,
                email,
                displayEmail,
                department,
                bio
            };
            
            this.#showSaveMessage("Profile information saved");
        }
        
        // save the updated profile data to IndexedDB
        await this.#saveToLocalDB();
    }

    #showSaveMessage(message) {
        const saveMessageElement = document.getElementById("saveMessage");
        if (saveMessageElement) {
            saveMessageElement.textContent = message;
            saveMessageElement.classList.add("show");
            
            // Hide the message after a few seconds
            setTimeout(() => {
                saveMessageElement.classList.remove("show");
            }, 3000);
        }
    }
}