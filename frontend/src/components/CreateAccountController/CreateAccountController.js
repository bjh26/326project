import { BaseComponent } from "../BaseComponent/BaseComponent.js";
import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';
import { LocalDB } from '../../services/LocalDB.js';

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
        this.#container = document.createElement("div");
        this.#container.id = "account-creation-container";

        this.#profileData = await LocalDB.get("accountCreateData");

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

                if (!("email" in this.#profileData ) || this.#profileData.email === "") {
                    console.log("unable to save due to missing email");
                    return;
                }

                try {
                    await this.#saveToServer();
                } catch (error) {
                    alert(`${error.message}`);
                    return;
                }
                
                // then navigate to the home page
                alert("Successfully created account!");
                await this.#hub.publish(Events.NavigateTo, { page: "home" });
            });
        }
    }

    async #saveToServer() {
        const profile = this.#profileData;
        profile.researchItems = [];
    
        if(document.getElementById('email').value === '' || document.getElementById('email').value === null){
            alert("Please enter in your email.");
            return;
        }
    
        const res = await fetch('/profile', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profile),
        });

        if(!res.ok) {
            const errorMessage = await res.json(); 
            throw new Error(errorMessage.error);
        }
    }

    async #saveAccountCreateData() {
        const firstName = this.#container.querySelector("#firstName")?.value;
        const lastName = this.#container.querySelector("#lastName")?.value;
        const email = this.#container.querySelector("#email")?.value;
        const displayEmail = this.#container.querySelector("#displayEmail")?.checked;
        const department = this.#container.querySelector("#department")?.value;
        const bio = this.#container.querySelector("#bio")?.value;
        
        if(!email || email.value === ''){
            alert("Please enter in your email.");
            return;
        }

        // update profile data with new values
        this.#profileData = {
            ...this.#profileData, // keep existing data
            firstName,
            lastName,
            email,
            displayEmail,
            department,
            bio
        };

        await LocalDB.put("accountCreateData", this.#profileData);
    }

    #loadSkeleton() {
        const wrapper = document.createElement("div");
        wrapper.id = "wrapper";
        wrapper.innerHTML = `<div class = "dashboard">
                                <h2>Create Profile</h2>
                                <div class = "upload-documents">
                                    <div id = "uploadProfileImage" class="profile-image">
                                        <label for="profileImage"> 
                                            <img src = "/Sample_User_Icon.png" id="dummyProfileImage">
                                        </label>
                                        <input type="file" id="profileImage" accept=".jpeg, .jpg, .png" style="display: none">
                                    </div> 
                                    <div id="uploadResume" class="resume-upload">
                                        <label for="resume" id="resumeLabel">upload your resume
                                            <input type="file" id="resume" accept=".pdf, .doc, .docx" style="visibility:hidden">
                                        </label>
                                    </div>    
                                </div>
                                <form class="short-response">
                                    <label for = "firstName">First Name<input type = "text" id = "firstName"></label>
                                    <label for="lastName">Last Name<input type="text" id="lastName"></label>
                                    <label for ="email">Email<input type="text" id="email" required></label>
                                    <label for = "department">Department</label>
                                    <select id = "department">
                                        <option value = "Biology">Biology</option>
                                        <option value = "Political Science">Political Science</option>
                                        <option value = "Computer Science">Computer Science</option>
                                    </select>
                                </form>
                                <div class="long-response">
                                    <label for = "bio">Bio</label>
                                    <textarea id = "bio"></textarea>
                                </div>             
                            </div>
                            <div class="button-container">
                                <input class="button" type="button" value="Save" id="save">  
                                <input class="create-button" type="submit" value="create new account" id="createAccount">  
                                <input class="create-button" type="submit" value="delete account" id="deleteAccount">    
                            </div>
                        `;
        this.#container.appendChild(wrapper);
    }
}