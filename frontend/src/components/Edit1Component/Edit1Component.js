import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class Edit1Component extends BaseComponent {
    constructor() {
        super();
    }

    render() {
        this.loadCSS("components/Edit1Component", "style");
        const container = document.createElement("div");
        container.classList.add("form");
        container.id = "info-form";
        container.innerHTML = ` <h1>Edit Profile</h1>
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
                                    </select>
                                    <label for="bio">Bio</label>
                                    <textarea id="bio" class="user-input"></textarea>
                                </form>
                                <div class="form-actions">
                                    <input type="button" id="save" class="save-button button" value="Save">
                                    <input type="submit" id="finish" class="next-button button" value="Save & Quit">
                                    <input type="submit" id="next" class="next-button button" value="Next">
                                </div>
                                <span id="saveMessage" class="save-message"></span>
                            `;
        return container;
    }
}