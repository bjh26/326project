import { BaseComponent } from "../BaseComponent/BaseComponent";

export class SideColumnComponent extends BaseComponent {

    constructor(firstName, lastName, bio, includeEmail, email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.bio = bio;
        this.includeEmail = includeEmail;
        this.email = email;
        super();
    }

    /**
     * Renders the side column.
     * @returns {HTMLElement}
     */
    render() {
        const sideColumn = document.createElement('div');
        sideColumn.classList.add('left-column');
        if(this.includeEmail) {
            sideColumn.innerHTML = 
            `
            <div id="pfp">
                <span class="dot"></span>
            </div>
            <div id="info" class="side-column-text">
                <b>${this.firstName} ${this.lastName}</b>
                <p>${this.email}</p>
            </div>
            <div id="bio" class="side-column-text">
                <p>${this.bio}</p>
            </div>
            `;
        } else {
            sideColumn.innerHTML = 
            `
            <div id="pfp">
                <span class="dot"></span>
            </div>
            <div id="info" class="side-column-text">
                <b>${this.firstName} ${this.lastName}</b>
            </div>
            <div id="bio" class="side-column-text">
                <p>${this.bio}</p>
            </div>
            `;
        }
        return sideColumn;
      }
}