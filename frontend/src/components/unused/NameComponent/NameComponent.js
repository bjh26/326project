import { BaseComponent } from "../../BaseComponent/BaseComponent";

export class NameComponent extends BaseComponent {
    constructor(firstName, lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }
    
    render() {
        const nameElement = document.createElement('h2'); // Using h2 for the name
        nameElement.innerHTML = `<em>${this.firstName} ${this.lastName}</em>`;
        return nameElement;
    }
}