import { BaseComponent } from "../BaseComponent/BaseComponent";

export class InfoFormComponent extends BaseComponent {

    constructor() {
        super();
    }

    /**
     * Renders the information input form.
     * @returns {HTMLElement}
     */
    render() {
        const formContainer = document.createElement('div');
        formContainer.classList.add('???');
        formContainer.innerHTML = 
        `
        <form id="userInfoForm">
            <label for="firstName">First Name</label> 
            <input  type="text" id="firstName" required>
            <label for="lastName">Last Name</label> 
            <input  type="text" id="lastName" required>
            <label for="email">UMass Email</label>
            <input  type="email" id="email" required>
            <select id = "department">
                <option value = "biology">Biology</option>
                <option value = "political-science">Political Science</option>
                <option value = "computer-science">Computer Science</option>
            </select>
            <label for="bio">Bio</label>
            <textarea id="bio"></textarea>
        </form> 
        `;
        return formContainer;
    }
}