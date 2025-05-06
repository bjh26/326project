import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';
import Base64 from '../../services/base64.js';
import { LocalDB } from '../../services/LocalDB.js';
import { BaseComponent } from '../BaseComponent/BaseComponent.js';
import { Edit1Component } from '../Edit1Component/Edit1Component.js';
import { Edit2Component } from '../Edit2Component/Edit2Component.js';
import { Edit3Component } from '../Edit3Component/Edit3Component.js';
import { MainProfileComponent } from '../MainProfileComponent/MainProfileComponent.js';
import { umassMajors } from '../../assets/majors.js';

export class ProfilePageControllerComponent extends BaseComponent {
    #container = null; // private container for the component
    #currentProfilePage = null; // track the current page ("main", "edit1", "edit2", "edit3") 
    #hub; // EventHub instance for managing events

    #pageSequence = {
        "main": "edit1",
        "edit1": "edit2",
        "edit2": "edit3", 
        "edit3": "main"
    };

    #pageSequenceRev = {
        "edit2": "edit1", 
        "edit3": "edit2"
    };

    #email; // email of person whose profile we're viewing
    #canEdit; // whether user has perms to edit this profile
    #refreshed; // whether this page was triggered on a refresh

    #profileData;

    // constructor is called upon loading site for first time
    constructor(email, canEdit, refreshed) {
        super();
        // store EventHub instance for convenience
        this.#hub = EventHub.getInstance();
        this.#email = email;
        this.#canEdit = canEdit;
        this.#refreshed = refreshed;
    }

    async render() {
        this.#container = document.createElement("div");
        this.#container.id = "profile-page-container";

        // check if current page is in IndexedDB, otherwise default to login page
        this.#currentProfilePage = await LocalDB.get("currentProfilePage");
        if (!this.#currentProfilePage) {
            this.#currentProfilePage = "main"; // default to main
            await LocalDB.put("currentProfilePage", "main");
        }

        if (this.#refreshed) { // page was refreshed
            // load from IndexedDB
            this.#profileData = await LocalDB.get("profileData");
        } else {
            // load profile data from server into IndexedDB
            await this.#loadDataFromServer(this.#email);
        }        

        // load skeleton for current page into container
        this.#loadSkeleton(this.#currentProfilePage);

        // populate with information (now the elements will be in the DOM)
        this.#populatePage(this.#currentProfilePage);

        // add event listeners to content on current page
        this.#addEventListeners(this.#currentProfilePage);

        return this.#container;
    }

    async loadPage(page) {
        console.log(`Navigating to page: ${page}`);
        
        // Save the current page to IndexedDB
        await LocalDB.put("currentProfilePage", page);
        this.#currentProfilePage = page;
        
        // load skeleton for current page into container
        this.#loadSkeleton(this.#currentProfilePage);

        // populate with information (now the elements will be in the DOM)
        this.#populatePage(this.#currentProfilePage);

        // add event listeners to content on current page
        this.#addEventListeners(this.#currentProfilePage);
    }

    async #loadDataFromServer(email) {
        const response = await fetch(`/profile/${email}`);
        if (response.status === 404) {
            throw new Error(`Error: profile not found for email ${email}`);
        } else {
            console.log(`loading data from server for ${email}`);
            this.#profileData = await response.json();

            const jsonFormat = this.#profileData.researchItems;
            const keys = Object.keys(jsonFormat);
            const arrayFormat = new Array(keys.length);
            keys.forEach(i => arrayFormat[i] = jsonFormat[i]);
            this.#profileData.researchItems = arrayFormat;

            await this.#saveToLocalDB();
        }
    }

    async #saveToLocalDB() {
        await LocalDB.put("profileData", this.#profileData);
    }

    async #saveToServer() {
        // load from IndexedDB
        this.#profileData = await LocalDB.get("profileData");
        
        let arrayFormat;

        // make sure researchItems exists
        if (!this.#profileData.researchItems) {
            this.#profileData.researchItems = {};
        } else { // convert researchItems to JSON
            arrayFormat = this.#profileData.researchItems;
            const jsonFormat = {};
            arrayFormat.researchItems.forEach((element, index) => jsonFormat[i] = element);
            this.#profileData.researchItems = jsonFormat;
        }

        // upload to server
        await fetch(`/profile/${this.#profileData.email}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(this.#profileData)
        });

        // convert back to array
        if (arrayFormat) {
            this.#profileData.researchItems = arrayFormat;
        }

    }

    #loadSkeleton(page) {    
        this.#container.innerHTML = "";
        
        if (page === "main") {
            const mainProfileComponent = new MainProfileComponent();
            this.#container.appendChild(mainProfileComponent.render(this.#canEdit));
        } else if (page === "edit1") {
            const edit1Component = new Edit1Component();
            this.#container.appendChild(edit1Component.render());
        } else if (page === "edit2") {
            const edit2Component = new Edit2Component();
            this.#container.appendChild(edit2Component.render());
        } else if (page === "edit3") {
            const edit3Component = new Edit3Component();
            this.#container.appendChild(edit3Component.render());
        } else {
            throw new Error(`Invalid page: ${page}`);
        }
    }

    #populatePage(page) {
        if (page === 'main') {
            console.log("populating main page");
            // display profile data for main page
            if (this.#profileData) {
                console.log("found profile data");
                
                const fullNameElement = this.#container.querySelector("#fullName");
                if (fullNameElement) {
                    fullNameElement.textContent = `${this.#profileData.firstName || 'FirstName'} ${this.#profileData.lastName || 'LastName'}`; // default values if name not found
                } else {
                    console.log("could not find fullName element");
                }

                const departmentDisplay = this.#container.querySelector("#departmentDisplay");
                if (departmentDisplay && this.#profileData.department) {
                    departmentDisplay.textContent = this.#profileData.department;
                }
                
                const emailDisplay = this.#container.querySelector("#emailDisplay");
                if (emailDisplay) {
                    if (this.#profileData.displayEmail && this.#profileData.email) {
                        emailDisplay.textContent = this.#profileData.email;
                    } else {
                        // don't display anything if email is not set to be displayed
                        emailDisplay.textContent = "";
                    }
                }
                
                const bioDisplay = this.#container.querySelector("#bioDisplay");
                if (bioDisplay && this.#profileData.bio) {
                    bioDisplay.textContent = this.#profileData.bio;
                }

                // display pfp
                const pfpDiv = this.#container.querySelector("#pfp");
                if (pfpDiv && this.#profileData.pfp && this.#profileData.mime) {
                    pfpDiv.innerHTML = "";
                    const pfpDisplay = document.createElement("img");
                    const imgFile = Base64.convertBase64ToFile(this.#profileData.pfp, this.#profileData.mime);
                    const imageURL = URL.createObjectURL(imgFile);
                    pfpDisplay.src = imageURL;
                    pfpDiv.appendChild(pfpDisplay);
                }

                // display resume
                const resumeDiv = this.#container.querySelector("#resume");
                if (resumeDiv && this.#profileData.resume) {
                    // Create data URL
                    const resumeDataUrl = `data:application/pdf;base64,${this.#profileData.resume}`;

                    // // Create download link
                    // const link = document.createElement("a");
                    // link.href = resumeDataUrl;
                    // link.download = "resume.pdf";
                    // link.textContent = "Download Resume";
                    // link.target = "_blank";

                    // View in new tab
                    const link = document.createElement("a");
                    link.href = "#";
                    link.textContent = "View Resume";

                    // // Create iframe to display PDF
                    // const iframe = document.createElement("iframe");
                    // iframe.src = resumeDataUrl;
                    // iframe.width = "100%";
                    // iframe.height = "600px";
                    // iframe.style.border = "1px solid #ccc";
                    // iframe.style.marginTop = "10px";

                    // Append both to the container
                    resumeDiv.appendChild(link);
                    // resumeDiv.appendChild(iframe);

                    link.addEventListener("click", e => {
                        e.preventDefault();
                    
                        const newWindow = window.open("", "_blank");
                        if (newWindow) {
                            newWindow.document.write(`
                                <html>
                                    <head>
                                        <title>${this.#profileData.firstName}'s Resume</title>
                                    </head>
                                    <body style="margin:0">
                                        <iframe src="${resumeDataUrl}" 
                                                style="width:100vw; height:100vh; border:none;"></iframe>
                                    </body>
                                </html>
                            `);
                            newWindow.document.close();
                        }
                    });
                }

                // resumeDiv.innerHTML = "";
                    // const resumeDisplay = document.createElement("???");
                    // const resumeFile = Base64.convertBase64ToFile(this.#profileData.pfp, "application/pdf");
                    // const imageURL = URL.createObjectURL(imgFile);
                    // pfpDisplay.src = imageURL;
                    // pfpDiv.appendChild(pfpDisplay);
            }

            // display research items
            if (this.#profileData?.researchItems?.length > 0) {
                const mainBody = this.#container.querySelector("#mainBody");
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
                const firstNameInput = this.#container.querySelector("#firstName");
                const lastNameInput = this.#container.querySelector("#lastName");
                const emailInput = this.#container.querySelector("#email");
                const displayEmailCheckbox = this.#container.querySelector("#displayEmail");
                const departmentSelect = this.#container.querySelector("#department");
                const bioTextarea = this.#container.querySelector("#bio");
                
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
            const departmentSelect = this.#container.querySelector("#department");
            if (departmentSelect) {
                umassMajors.sort();
                umassMajors.forEach(major => {
                    const option = document.createElement("option");
                    option.value = major;
                    option.text = major;
                    departmentSelect.add(option);
                });
            }
        } else if (page === 'edit3') {
            this.#renderResearchItems();
        }
    }

    /**
     * Allows for drag and drop and manual upload operations on input fields.
     * @param {HTMLElement} div - The div where your input element resides in.
     * @param {HTMLElement} inputElement - The file upload input field.
     * @param {string} type - Either "pfp" or "resume".
     */
    #addDragAndDropAndManualUploadFunctionality(div, inputElement, type) {
            
        div.addEventListener("dragover", e => {
            e.preventDefault(); 
            div.style.backgroundColor = "#881111";
        });

        div.addEventListener("dragleave", () => {
            div.style.backgroundColor = "lightgray";
            div.style.color = "white";
        });

        // drag and drop
        div.addEventListener("drop", async e => {
            e.preventDefault();
            const file = e.dataTransfer.files[0]; 
            console.log("Dropped file:", file.name, file.type, file.size);

            await this.#saveFileToLocalDB(file, type);
        });


        // manual upload
        inputElement.addEventListener("change", async e => {
            e.preventDefault();
            const file = e.target.files[0];
            console.log("Uploaded file:", file.name, file.type, file.size);

            await this.#saveFileToLocalDB(file, type);
        });
    }

    async #saveFileToLocalDB(file, type) {
        const reader = new FileReader();
        reader.onload = async e => {
            // display image
            if (file.type.startsWith("image/") && this.#container.querySelector("#dummyProfileImage")) {
                this.#container.querySelector("#dummyProfileImage").src = e.target.result;
            }

            // We need to remove the prefix from the resulting base64 string.
            // The prefix is "data:application/octet-stream;base64," which is
            // not needed when converting back to blob. In fact, it causes
            // the conversion to fail.
            const base64 = reader.result.split(",")[1];
            this.#profileData[type] = base64;
            if (file.type.startsWith("image/")) {
                this.#profileData.mime = file.type;
            }
            await this.#saveToLocalDB();
        }
        reader.readAsDataURL(file);
    }

    #addEventListeners() {
        // add event listeners for the 'Next' button
        const nextButton = this.#container.querySelector("#next");
        if (nextButton) {
            nextButton.addEventListener("click", async (event) => {
                event.preventDefault(); // prevent form submission default behavior
                
                // save the current page data first
                await this.#saveCurrentPageData();
                
                // then navigate to the next page
                const nextPage = this.#pageSequence[this.#currentProfilePage];
                await this.loadPage(nextPage);
            });
        }

        // add event listener for the 'Edit' button on the main page
        const editButton = this.#container.querySelector("#edit");
        if (editButton) {
            editButton.addEventListener("click", async () => {
                await this.loadPage("edit1");
            });
        }

        // add event listener for the 'Home' button
        const homeButton = this.#container.querySelector("#home");
        if (homeButton) {
            homeButton.addEventListener("click", async () => {
                console.log("home button clicked");
                await this.#hub.publish(Events.NavigateTo, { page: "home" });
            });
        }

        // add event listeners for the 'Save' button
        const saveButton = this.#container.querySelector("#save");
        if (saveButton) {
            saveButton.addEventListener("click", async () => {
                console.log("Save button clicked on", this.#currentProfilePage);
                await this.#saveCurrentPageData();
            });
        }

        // add event listener for the 'Back' button
        const backButton = this.#container.querySelector("#back");
        if (backButton) {
            backButton.addEventListener("click", async () => {
                // then navigate to the previous page
                const nextPage = this.#pageSequenceRev[this.#currentProfilePage];
                await this.loadPage(nextPage);
            });
        }

        // add event listener for the 'Finish' button
        const finishButton = this.#container.querySelector("#finish");
        if (finishButton) {
            finishButton.addEventListener("click", async (event) => {
                event.preventDefault(); // prevent form submission default behavior
                
                // Save the current page data first
                await this.#saveCurrentPageData();
                await this.#saveToServer();
                
                // then navigate to the main page
                // setTimeout(async () => {
                //     await this.loadPage("main");
                    
                // }, 1000);
                await this.loadPage("main");
            });
        }

        // add event listener for the 'add' research button on edit3 page
        const addResearchButton = this.#container.querySelector("#addResearch");
        if (addResearchButton) {
            addResearchButton.addEventListener("click", async () => {
                const title = this.#container.querySelector("#title")?.value;
                const link = this.#container.querySelector("#link")?.value;
                const type = this.#container.querySelector("#type")?.value;
                const description = this.#container.querySelector("#description")?.value;
                
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
                this.#container.querySelector("#title").value = "";
                this.#container.querySelector("#link").value = "";
                this.#container.querySelector("#type").value = "Paper";
                this.#container.querySelector("#description").value = "";
                
                // update the display
                this.#renderResearchItems();
                
                // save the profile data (which includes research items)
                await this.#saveProfileData();
            });
        }

        const pfpDiv = this.#container.querySelector("#profilePictureArea");
        const pfpInputElement = this.#container.querySelector("#profilePictureInput");
        const pfpText = this.#container.querySelector("#pfpFileSelect");
        if (pfpDiv && pfpInputElement && pfpText) {
            this.#addDragAndDropAndManualUploadFunctionality(pfpDiv, pfpInputElement, "pfp");
            pfpText.addEventListener("click", () => pfpInputElement.click());
        }

        const resumeDiv = this.#container.querySelector("#resumeArea");
        const resumeInputElement = this.#container.querySelector("#resumeInput");
        const resumeText = this.#container.querySelector("#resumeFileSelect");
        if (resumeDiv && resumeInputElement && resumeText) {
            this.#addDragAndDropAndManualUploadFunctionality(resumeDiv, resumeInputElement, "resume");
            resumeText.addEventListener("click", () => resumeInputElement.click());
        }

    }

    #renderResearchItems() {
        const container = this.#container.querySelector("#researchItemsContainer");
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
        const titleInput = this.#container.querySelector("#title");
        const linkInput = this.#container.querySelector("#link");
        const typeSelect = this.#container.querySelector("#type");
        const descriptionTextarea = this.#container.querySelector("#description");
        const addButton = this.#container.querySelector("#addResearch");
        
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
        } else if (this.#currentProfilePage === 'edit2') {
            // TODO: implement uploading files to IndexedDB
            this.#showSaveMessage("Profile picture and resume settings saved");
        } else if (this.#currentProfilePage === 'edit3') {
            // this is already handled by add/edit/delete research item functions
            // so this.#profileData will have already been updated
            // all that's left is to save to IndexedDB
            await this.#saveToLocalDB();
        } 
    }

    async #saveProfileData() {
        // for edit1 page, update the basic profile info
        if (this.#currentProfilePage === 'edit1') {
            const firstName = this.#container.querySelector("#firstName")?.value;
            const lastName = this.#container.querySelector("#lastName")?.value;
            const email = this.#container.querySelector("#email")?.value;
            const displayEmail = this.#container.querySelector("#displayEmail")?.checked;
            const department = this.#container.querySelector("#department")?.value;
            const bio = this.#container.querySelector("#bio")?.value;
            
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
        const saveMessageElement = this.#container.querySelector("#saveMessage");
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