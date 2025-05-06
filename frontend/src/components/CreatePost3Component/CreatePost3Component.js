import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class CreatePost3Component extends BaseComponent {
    constructor() {
        super();
    }

    render() {
        const container = document.createElement("div");
        container.classList.add("step");
        container.id = "step3";
        container.innerHTML = ` <div class="post-form">
                                    <label for="contact-name">Contact Name</label>
                                    <input type="text" name="contact-name" id="contact-name">
                                </div>
                        
                                <div class="post-form">
                                    <label for="contact-email">Contact Email</label>
                                    <input type="email" name="contact-email" id="contact-email">
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