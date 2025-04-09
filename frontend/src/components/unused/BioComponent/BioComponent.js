import { BaseComponent } from "../BaseComponent/BaseComponent";

export class BioComponent extends BaseComponent {
    constructor(bio) {
        this.bio = bio;
    }
    
    render() {
        const bioElement = document.createElement('p');
        bioElement.textContent = this.bio;
        return bioElement;
    }
}