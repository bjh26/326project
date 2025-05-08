import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class Edit3Component extends BaseComponent {
    constructor() {
        super();
    }

    render() {
        this.loadCSS("components/Edit3Component", "style");
        const container = document.createElement("div");
        container.classList.add("form");
        container.id = "info-form";
        container.innerHTML = ` <h1>Add Research Interests</h1>
                                <form id="researchBlockForm" class="form-grid">
                                    <div class="grid-row">
                                        <div>
                                            <label for="title">Title</label> 
                                            <input type="text" id="title" class="user-input" required>
                                        </div>
                                        <div>
                                            <label for="link">Link (optional)</label> 
                                            <input type="text" id="link" class="user-input">
                                        </div>
                                        <div>
                                            <label for="type">Type</label>
                                            <select id="type" class="user-input">
                                                <option value="Paper">Paper</option>
                                                <option value="Lab">Lab</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="full-row">
                                        <label for="description">Description</label> 
                                        <textarea id="description" class="user-input description-input" required></textarea>
                                        <input type="button" id="addResearch" class="button full-width-button" value="Add">
                                    </div>
                                </form>
                                <div class="research-items-container" id="researchItemsContainer">
                                    <!-- Research items will be added here dynamically -->
                                </div>
                                <div class="form-actions">
                                    <input type="button" id="save" class="save-button button" value="Save">
                                    <input type="submit" id="back" class="next-button button" value="Back">
                                    <input type="submit" id="finish" class="next-button button" value="Finish">
                                </div>
                                <span id="saveMessage" class="save-message"></span>
                            `;
        return container;
    }
}