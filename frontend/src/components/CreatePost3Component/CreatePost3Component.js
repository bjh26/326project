import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class CreatePost3Component extends BaseComponent {
    constructor() {
        super();
    }

    // In CreatePost3Component.js, update the render method:

    render() {
        this.loadCSS("components/CreatePost3Component", "style");
        const container = document.createElement("div");
        container.classList.add("step");
        container.classList.add("active");
        container.id = "step3";
        container.innerHTML = ` <div class="post-form">
                                    <label for="contactName">Contact Name <span class="required">*</span></label>
                                    <input type="text" name="contactName" id="contactName" required>
                                </div>
                        
                                <div class="post-form">
                                    <label for="contactEmail">Contact Email <span class="required">*</span></label>
                                    <input type="email" name="contactEmail" id="contactEmail" required>
                                </div>
                        
                                <div class="buttons">
                                    <input type="button" class="form-button" id="cancel" value="Cancel">
                                    <input type="button" class="form-button" id="save" value="Save">
                                    <input type="button" class="form-button" id="back" value="Back">
                                    <input type="submit" class="form-button" id="post" value="Post">
                                </div>
                                <div id="saveMessage" class="save-message"></div>
                                <div class="form-help">Fields marked with <span class="required">*</span> are required</div>
                            `;
        return container;
    }
}