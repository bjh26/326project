import { BaseComponent } from "../BaseComponent/BaseComponent.js";
import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';
import { LocalDB } from '../../services/LocalDB.js';
import { umassMajors } from "../../assets/majors.js";

export class CreateAccountControllerComponent extends BaseComponent {
    #container;
    #hub;
    #profileData;

    constructor() {
        super();

        // store EventHub instance for convenience
        this.#hub = EventHub.getInstance();
    }

    async render() {
        this.loadCSS("components/CreateAccountController", "style");
        this.#container = document.createElement("div");
        this.#container.id = "account-creation-container";

        this.#profileData = await LocalDB.get("accountCreateData") || {};

        this.#loadSkeleton();

        this.#populatePage();

        this.#addEventListeners();

        return this.#container;
    }

    #populatePage() {
        if (this.#profileData) {
            const firstNameInput = this.#container.querySelector("#firstName");
            const lastNameInput = this.#container.querySelector("#lastName");
            const emailInput = this.#container.querySelector("#email");
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
    }

    #addEventListeners() {
        // add event listeners for the 'save' button
        const saveButton = this.#container.querySelector("#save");
        if (saveButton) {
            saveButton.addEventListener("click", async () => {
                await this.#saveAccountCreateData();
            });
        }

        // add event listener for finish button to also save to server
        const finishButton = this.#container.querySelector("#createAccount");
        if (finishButton) {
            finishButton.addEventListener("click", async (event) => {
                event.preventDefault(); // prevent form submission default behavior
                
                // Save the current page data first
                await this.#saveAccountCreateData();

                const containsRequiredFields = () => (this.#profileData.firstName !== "" && this.#profileData.lastName !== ""  && this.#profileData.email !== "");
                if (!containsRequiredFields()) {
                    alert("Please enter your name and UMass email.");
                    return;
                }

                const emailRegex = /^[a-zA-Z0-9._%+-]+@umass\.edu$/;
                if (!emailRegex.test(this.#profileData.email)) {
                    alert("Please use a UMass email.");
                    return;
                }

                try {
                    await this.#saveToServer();
                    alert("Successfully created account!");
                    await LocalDB.put("sessionEmail", this.#profileData.email);
                    await LocalDB.delete("accountCreateData");
                    await this.#hub.publish(Events.NavigateTo, { page: "profile", info: {email:this.#profileData.email, canEdit:true} });
                } catch (error) {
                    if (error.message === "A profile with this email already exists.") {
                        alert("A profile with this email already exists.");
                    } else {
                        alert("There was a problem when creating your account.", error.message);
                    }
                    return;
                }
                
            });
        }

        // add event listener for login link
        const loginLink = this.#container.querySelector("#loginLink");
        if (loginLink) {
            loginLink.addEventListener("click", async () => {
                await this.#hub.publish(Events.NavigateTo, { page: "login" });
            });
        }

        const pfpDiv = this.#container.querySelector("#uploadProfileImage");
        const pfpInputElement = this.#container.querySelector("#profileImage");
        this.#addDragAndDropAndManualUploadFunctionality(pfpDiv, pfpInputElement, "pfp");

        const resumeDiv = this.#container.querySelector("#uploadResume");
        const resumeInputElement = this.#container.querySelector("#resume");
        this.#addDragAndDropAndManualUploadFunctionality(resumeDiv, resumeInputElement, "resume");
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
            div.style.color = "white";
        });

        div.addEventListener("dragleave", () => {
            div.style = ""; // go back to default style
        });

        // drag and drop
        div.addEventListener("drop", async e => {
            e.preventDefault();
            const file = e.dataTransfer.files[0]; 
            console.log("Dropped file:", file.name, file.type, file.size);
            try {
                await this.#saveFileToLocalDB(file, type);
            } catch (error) {
                alert("Unable to upload file.", error.message);
            }
            if (type === "resume") {
                div.textContent = "Resume uploaded";
            }
        });


        // manual upload
        inputElement.addEventListener("change", async e => {
            e.preventDefault();
            const file = e.target.files[0];
            console.log("Uploaded file:", file.name, file.type, file.size);
            try {
                await this.#saveFileToLocalDB(file, type);
            } catch (error) {
                alert("Unable to upload file.", error.message);
            }
            if (type === "resume") {
                div.style.backgroundColor = "#881111";
                div.style.color = "white";
                div.textContent = "Resume uploaded";
            }
        });
    }

    async #saveFileToLocalDB(file, type) {
        const reader = new FileReader();
        reader.onload = async e => {
            // display image
            if (file.type.startsWith("image/")) {
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
            await this.#saveAccountCreateData();
        }
        reader.readAsDataURL(file);
    }

    async #saveToServer() {
            
        const res = await fetch('/profile', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(this.#profileData),
        });

        if (!res.ok) {
            const contentType = res.headers.get("content-type");
        
            if (contentType && contentType.includes("application/json")) {
                const errorMessage = await res.json();
                throw new Error(errorMessage.message || "Server returned an error.");
            } else {
                const text = await res.text(); // fallback to plain text
                console.error("Unexpected response:", text);
                throw new Error(`Server error: ${res.status}`);
            }
        }
        
    }

    async #saveAccountCreateData() {
        const firstName = this.#container.querySelector("#firstName")?.value;
        const lastName = this.#container.querySelector("#lastName")?.value;
        const email = this.#container.querySelector("#email")?.value;
        const department = this.#container.querySelector("#department")?.value;
        const bio = this.#container.querySelector("#bio")?.value;

        // update profile data with new values
        this.#profileData = {
            ...this.#profileData, // keep existing data
            firstName,
            lastName,
            email,
            department,
            bio
        };

        try {
            await LocalDB.put("accountCreateData", this.#profileData);
        } catch (error) {
            alert("Unable to save data locally.", error.message);
        }
    }

    #loadSkeleton() {
        const wrapper = document.createElement("div");
        wrapper.id = "wrapper";
        wrapper.innerHTML = `<div class = "dashboard">
                                <h2>Create Profile</h2>
                                <div class = "upload-documents">
                                    <div id = "uploadProfileImage" class="profile-image">
                                        <label for="profileImage"> 
                                            <img src = "assets/Sample_User_Icon.png" id="dummyProfileImage" alt="User Icon">
                                        </label>
                                        <input type="file" id="profileImage" accept="image/*" style="display: none">
                                    </div> 
                                    <div id="uploadResume" class="resume-upload">
                                        <label for="resume" id="resumeLabel">upload your resume
                                            <input type="file" id="resume" accept="application/pdf" style="visibility: hidden">
                                        </label>
                                    </div>    
                                </div>
                                <form class="short-response">
                                    <label for = "firstName">First Name<input type = "text" id = "firstName"></label>
                                    <label for = "lastName">Last Name<input type="text" id="lastName"></label>
                                    <label for ="email">Email<input type="text" id="email" required></label>
                                    <label for = "department">Department</label>
                                    <select id = "department">
                                    </select>
                                </form>
                                <div class="long-response">
                                    <label for = "bio">Bio</label>
                                    <textarea id = "bio"></textarea>
                                </div>             
                            </div>
                            <div class="button-container">
                                <div class="buttons-row">
                                    <input class="button" type="button" value="Save" id="save">  
                                    <input class="button" type="submit" value="Create Account" id="createAccount">  
                                </div>
                                <div class="login-link-row">
                                    <p>Already have an account? <button id="loginLink" class="login-link">Sign in</button></p>

                                </div>
                            </div>
                        `;
        this.#container.appendChild(wrapper);
    }
}