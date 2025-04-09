import { BaseComponent } from "../../BaseComponent/BaseComponent";

export class EmailComponent extends BaseComponent {
    constructor(email) {
        this.email = email;
    }
    
    render() {
        const emailElement = document.createElement('p');
        emailElement.textContent = this.email;
        return emailElement;
    }
}