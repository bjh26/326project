import { DataBase } from "../services/DataBase.js";

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
              <b>FirstName LastName</b>
              <p>email@umass.edu</p>
          </div>
          <div id="bio" class="side-column-text">
              <p>bio paragraph here</p>
          </div>
        </div>
        <div id="mainBody" class="right-column">
          <div id="research1" class="research-element">
              <h1>Research Paper 1</h1>
          </div>
          <div id="research2" class="research-element">
              <h1>Research Paper 2</h1>
          </div>
          <div id="research3" class="research-element">
              <h1>Research Paper 3</h1>
          </div>
          <div id="research4" class="research-element">
              <h1>Research Lab</h1>
          </div>
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
                        <input type="email" id="email" class="user-input" required>
                        <div class="checkbox-container">
                            <input type="checkbox" id="displayEmail" class="styled-checkbox">
                            <label for="displayEmail" class="non-bold">Display on profile</label>
                        </div>
                    </div>
                    <label for="department">Department</label>
                    <select id = "department" class="user-input">
                        <option value = "biology">Biology</option>
                        <option value = "political-science">Political Science</option>
                        <option value = "computer-science">Computer Science</option>
                    </select>
                    <label for="bio">Bio</label>
                    <textarea id="bio" class="user-input"></textarea>
                </form>
                <div class="form-actions">
                    <input type="button" id="save" class="save-button button" value="Save">
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
                    <input type="button" id="save" class="save-button button" value="Save">
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
                                <option value="paper">Paper</option>
                                <option value="lab">Lab</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="full-row">
                        <label for="description">Description</label> 
                        <textarea id="description" class="user-input description-input" required></textarea>
                        <input type="button" class="button full-width-button" value="Add">
                    </div>
                </form>
                <div class="form-actions">
                    <input type="button" id="save" class="save-button button" value="Save">
                    <input type="submit" id="next" class="next-button button" value="Finish">
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

    constructor(document, dataBaseService) {
        this.#document = document;
        this.#container = document.getElementById("app");
    }

    loadPage(page) {
        this.#currentPage = page;
        this.#container.innerHTML = this.pages[page];
        this.loadCSS(`./${page}/styles.css`);
        
        // After loading the page, add event listeners
        this.setupEventListeners();
    }

    loadCSS(cssPath) {
        const link = this.#document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssPath;
        this.#document.head.appendChild(link);
    }

    setupEventListeners() {
        // Add event listeners for the 'next' button
        const nextButton = this.#document.getElementById("next");
        if (nextButton) {
            nextButton.addEventListener("click", async (event) => {
                event.preventDefault(); // Prevent form submission default behavior
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

        // Add event listeners for the 'save' buttons if needed
        const saveButton = this.#document.getElementById("save");
        if (saveButton) {
            saveButton.addEventListener("click", () => {
                // Implement your save functionality here
                console.log("Save button clicked on", this.#currentPage);
                // You could save form data to the database here
            });
        }
    }
}