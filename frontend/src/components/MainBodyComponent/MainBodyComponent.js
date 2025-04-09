import { BaseComponent } from "../BaseComponent/BaseComponent";

export class MainBodyComponent extends BaseComponent {

    constructor(researchBlocks = []) {
        this.researchBlocks = researchBlocks; // array of ResearchBlockComponents
        super();
    }

    /**
     * Renders the research blocks.
     * @returns {HTMLElement}
     */
    render() {
        const mainBody = document.createElement('div');
        mainBody.classList.add('right-column');
        this.researchBlocks.forEach(block => {
            mainBody.appendChild(block.render());
        });
        return mainBody;
    }
}