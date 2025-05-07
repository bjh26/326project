import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';
import { LocalDB } from "../../services/LocalDB.js";
import { BaseComponent } from "../BaseComponent/BaseComponent.js";
import { CreatePost1Component } from "../CreatePost1Component/CreatePost1Component.js";
import { CreatePost2Component } from "../CreatePost2Component/CreatePost2Component.js";
import { CreatePost3Component } from "../CreatePost3Component/CreatePost3Component.js";

export class CreatePostPageControllerComponent extends BaseComponent {

    #container = null; // private container for the component
    #currentCreatePage = null; // track the current page ("create1", "create2", "create3") 
    #hub; // EventHub instance for managing events

    #pageSequence = {
        "create1": "create2",
        "create2": "create3",
    };

    #pageSequenceRev = {
        "create2": "create1", 
        "create3": "create2"
    }

    #refreshed; // whether this page was triggered on a refresh

    #postData;

    // constructor is called upon loading site for first time
    constructor(refreshed) {
        super();
        // store EventHub instance for convenience
        this.#hub = EventHub.getInstance();
        this.#refreshed = refreshed;
    }

    async render() {
        this.#container = document.createElement("div");
        this.#container.id = "create-a-post-container";

        // check if current page is in IndexedDB, otherwise default to login page
        this.#currentCreatePage = await LocalDB.get("currentCreatePage");
        if (!this.#currentCreatePage) {
            this.#currentCreatePage = "create1"; // default to main
            await LocalDB.put("currentCreatePage", "create1");
        }

        const email = await LocalDB.get("sessionEmail");
        this.#postData = await LocalDB.get("postData") || { 
            author: email,
            postedDate: new Date().toISOString() // Add current date as posted date
        };  

        // load skeleton for current page into container
        this.#loadSkeleton(this.#currentCreatePage);

        // populate with information (now the elements will be in the DOM)
        this.#populatePage(this.#currentCreatePage);

        // add event listeners to content on current page
        this.#addEventListeners(this.#currentCreatePage);

        return this.#container;
    }

    async loadPage(page) {
        console.log(`Navigating to page: ${page}`);
        
        // Save the current page to IndexedDB
        await LocalDB.put("currentCreatePage", page);
        this.#currentCreatePage = page;
        
        // load skeleton for current page into container
        this.#loadSkeleton(this.#currentCreatePage);

        // populate with information (now the elements will be in the DOM)
        this.#populatePage(this.#currentCreatePage);

        // add event listeners to content on current page
        this.#addEventListeners(this.#currentCreatePage);
    }

    async #saveToLocalDB() {
        await LocalDB.put("postData", this.#postData);
    }

    async #saveToServer() {
        // load from IndexedDB
        this.#postData = await LocalDB.get("postData");

        // Format responsibilities and qualificationRequirement as JSON arrays if they are strings
        if (this.#postData.responsibilities && typeof this.#postData.responsibilities === 'string') {
            this.#postData.responsibilities = this.#postData.responsibilities
                .split('\n')
                .filter(item => item.trim() !== '');
        }

        if (this.#postData.qualificationRequirement && typeof this.#postData.qualificationRequirement === 'string') {
            this.#postData.qualificationRequirement = this.#postData.qualificationRequirement
                .split('\n')
                .filter(item => item.trim() !== '');
        }

        // upload to server
        try {
            const response = await fetch(`/researchPost`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify(this.#postData)
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error saving post to server:", error);
            throw error;
        }
    }

    #loadSkeleton(page) {    
        this.#container.innerHTML = "";
        
        if (page === "create1") {
            const create1Component = new CreatePost1Component();
            this.#container.appendChild(create1Component.render());
        } else if (page === "create2") {
            const create2Component = new CreatePost2Component();
            this.#container.appendChild(create2Component.render());
        } else if (page === "create3") {
            const create3Component = new CreatePost3Component();
            this.#container.appendChild(create3Component.render());
        } else {
            throw new Error(`Invalid page: ${page}`);
        }
    }

    #populatePage(page) {
        if (page === 'create1') {
            if (this.#postData) {
                const titleInput = this.#container.querySelector("#title");
                const descriptionTextArea = this.#container.querySelector("#description");
                const responsibilitiesTextArea = this.#container.querySelector("#responsibilities");

                if (titleInput && this.#postData.title) {
                    titleInput.value = this.#postData.title;
                }

                if (descriptionTextArea && this.#postData.description) {
                    descriptionTextArea.value = this.#postData.description;
                }

                if (responsibilitiesTextArea && this.#postData.responsibilities) {
                    // If responsibilities is an array, convert it to newline-separated string
                    if (Array.isArray(this.#postData.responsibilities)) {
                        responsibilitiesTextArea.value = this.#postData.responsibilities.join('\n');
                    } else {
                        responsibilitiesTextArea.value = this.#postData.responsibilities;
                    }
                }
            }
        } else if (page === 'create2') {
            if (this.#postData) {
                const qualificationRequirementTextArea = this.#container.querySelector("#qualificationRequirement");
                const compensationInput = this.#container.querySelector("#compensation");
                const hiringPeriodStartInput = this.#container.querySelector("#hiringPeriodStart");
                const hiringPeriodEndInput = this.#container.querySelector("#hiringPeriodEnd");
                const applicationInstructionsTextArea = this.#container.querySelector("#applicationInstructions");
                const deadlineDateInput = this.#container.querySelector("#deadline");

                if (qualificationRequirementTextArea && this.#postData.qualificationRequirement) {
                    // If qualificationRequirement is an array, convert it to newline-separated string
                    if (Array.isArray(this.#postData.qualificationRequirement)) {
                        qualificationRequirementTextArea.value = this.#postData.qualificationRequirement.join('\n');
                    } else {
                        qualificationRequirementTextArea.value = this.#postData.qualificationRequirement;
                    }
                }

                if (compensationInput && this.#postData.compensation) {
                    compensationInput.value = this.#postData.compensation;
                }

                if (hiringPeriodStartInput && this.#postData.hiringPeriodStart) {
                    // Format date for the date input (YYYY-MM-DD)
                    const date = new Date(this.#postData.hiringPeriodStart);
                    hiringPeriodStartInput.value = date.toISOString().split('T')[0];
                }

                if (hiringPeriodEndInput && this.#postData.hiringPeriodEnd) {
                    // Format date for the date input (YYYY-MM-DD)
                    const date = new Date(this.#postData.hiringPeriodEnd);
                    hiringPeriodEndInput.value = date.toISOString().split('T')[0];
                }

                if (applicationInstructionsTextArea && this.#postData.applicationInstructions) {
                    applicationInstructionsTextArea.value = this.#postData.applicationInstructions;
                }

                if (deadlineDateInput && this.#postData.deadline) {
                    // Format date for the date input (YYYY-MM-DD)
                    const date = new Date(this.#postData.deadline);
                    deadlineDateInput.value = date.toISOString().split('T')[0];
                }
            }
        } else if (page === 'create3') {
            if (this.#postData) {
                const contactNameInput = this.#container.querySelector("#contactName");
                const contactEmailInput = this.#container.querySelector("#contactEmail");

                if (contactNameInput && this.#postData.contactName) {
                    contactNameInput.value = this.#postData.contactName;
                }

                if (contactEmailInput && this.#postData.contactEmail) {
                    contactEmailInput.value = this.#postData.contactEmail;
                }                
            }
        }
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
                const nextPage = this.#pageSequence[this.#currentCreatePage];
                await this.loadPage(nextPage);
            });
        }

        // add event listener for the 'Back' button
        const backButton = this.#container.querySelector("#back");
        if (backButton) {
            backButton.addEventListener("click", async () => {
                // then navigate to the previous page
                const nextPage = this.#pageSequenceRev[this.#currentCreatePage];
                await this.loadPage(nextPage);
            });
        }

        // add event listener for the 'Cancel' button
        const cancelButton = this.#container.querySelector("#cancel");
        if (cancelButton) {
            cancelButton.addEventListener("click", async () => {
                await LocalDB.delete("postData");
                await this.#hub.publish(Events.NavigateTo, { page: "home" });
            });
        }

        // add event listeners for the 'Save' button
        const saveButton = this.#container.querySelector("#save");
        if (saveButton) {
            saveButton.addEventListener("click", async () => {
                await this.#saveCurrentPageData();
            });
        }

        // add event listener for 'Post' button
        const postButton = this.#container.querySelector("#post");
        if (postButton) {
            postButton.addEventListener("click", async (event) => {
                event.preventDefault(); // prevent form submission default behavior
                
                // save the current page data first
                await this.#saveCurrentPageData();

                // post to server
                try {
                    await this.#saveToServer();
                    alert("Successfully published post!");
                    // Navigate to the home page
                    await this.#hub.publish(Events.NavigateTo, { page: "home" });
                } catch (error) {
                    alert(`Error publishing post: ${error.message}`);
                }
            });
        }        
    }

    async #saveCurrentPageData() {
        // Save different data depending on the current page
        if (this.#currentCreatePage === 'create1') {
            const title = this.#container.querySelector("#title")?.value;
            const description = this.#container.querySelector("#description")?.value;
            const responsibilities = this.#container.querySelector("#responsibilities")?.value;

            // update profile data with new values
            this.#postData = {
                ...this.#postData, // keep existing data
                title,
                description,
                responsibilities
            };
        } else if (this.#currentCreatePage === 'create2') {
            const qualificationRequirement = this.#container.querySelector("#qualificationRequirement")?.value;
            const compensation = this.#container.querySelector("#compensation")?.value;
            const hiringPeriodStart = this.#container.querySelector("#hiringPeriodStart")?.value;
            const hiringPeriodEnd = this.#container.querySelector("#hiringPeriodEnd")?.value;
            const applicationInstructions = this.#container.querySelector("#applicationInstructions")?.value;
            const deadline = this.#container.querySelector("#deadline")?.value;

            // update profile data with new values
            this.#postData = {
                ...this.#postData, // keep existing data
                qualificationRequirement,
                compensation,
                hiringPeriodStart,
                hiringPeriodEnd,
                applicationInstructions,
                deadline
            };
        } else if (this.#currentCreatePage === 'create3') {
            const contactName = this.#container.querySelector("#contactName")?.value;
            const contactEmail = this.#container.querySelector("#contactEmail")?.value;

            // update profile data with new values
            this.#postData = {
                ...this.#postData, // keep existing data
                contactName,
                contactEmail
            };
        }
        try {
            await this.#saveToLocalDB();
            this.#showSaveMessage("Post information saved");
        } catch (error) {
            alert(`Error saving information: ${error.message}`);
            return;
        }
    }

    #showSaveMessage(message) {
        // alert(message);
        // Alternative implementation for a more elegant message display
        const saveMessageElement = this.#container.querySelector("#saveMessage");
        if (saveMessageElement) {
            saveMessageElement.textContent = message;
            saveMessageElement.classList.add("show");
            
            // Hide the message after a few seconds
            setTimeout(() => {
                saveMessageElement.classList.remove("show");
            }, 3000);
        } else {
            alert(message);
        }
    }
}