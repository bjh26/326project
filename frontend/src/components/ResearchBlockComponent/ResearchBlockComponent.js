import { BaseComponent } from "../BaseComponent/BaseComponent";

export class ResearchBlockComponent extends BaseComponent {

    constructor(title, description, link) {
        this.title = title;
        this.description = description;
        this.link = link;
        super();
    }

    /**
     * Renders the a single block.
     * @returns {HTMLElement}
     */
    render() {
        const block = document.createElement('div');
        block.classList.add('research-element');
        // build block here using title, description, link
        return block;
    }
}