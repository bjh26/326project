import { BaseComponent } from "../BaseComponent/BaseComponent";

export class UploadComponent extends BaseComponent {

    constructor(name) {
        this.name = name;
        super();
    }

    /**
     * Renders a component that lets users upload a file.
     * @returns {HTMLElement}
     */
    render() {
        const box = document.createElement('div');
        box.classList.add('upload-box');
        box.innerHTML = 
        `
        Upload ${this.name}
        <input type="file" id="file-upload" name="file-upload" accept=".jpeg, .png">
        `;
        return box; // need to integrate drag and drop upload feature
    }
}