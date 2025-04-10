import { BaseComponent } from "../BaseComponent/BaseComponent";

export class NextButtonComponent extends BaseComponent {

    constructor() {
        super();
    }

    /**
     * Renders the next button for the profile edit pages.
     * @returns {HTMLElement}
     */
    render() {
        const button = document.createElement('button');
        button.textContent = 'Next';
        return button;
    }
}