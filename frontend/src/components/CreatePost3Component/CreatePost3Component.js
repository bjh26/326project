import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class CreatePost3Component extends BaseComponent {
    constructor() {
        super();
    }

    render() {
        this.loadCSS("components/CreatePost3Component", "style");
        const container = document.createElement("div");
        container.classList.add("step");
        container.classList.add("active");
        container.id = "step3";
        container.innerHTML = ` <div class="post-form">
                                    <label for="contactName">Contact Name</label>
                                    <input type="text" name="contactName" id="contactName">
                                </div>
                        
                                <div class="post-form">
                                    <label for="contactEmail">Contact Email</label>
                                    <input type="email" name="contactEmail" id="contactEmail">
                                </div>
                        
                                <div class="buttons">
                                    <input type="button" class="form-button" id="cancel" value="Cancel">
                                    <input type="button" class="form-button" id="save" value="Save">
                                    <input type="button" class="form-button" id="back" value="Back">
                                    <input type="submit" class="form-button" id="post" value="Post">
                                </div>
                            `;
        return container;
    }
}