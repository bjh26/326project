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
                                    <button type="button" id="back2">Back</button>
                                    <button type="submit">Post</button>
                                </div>
                            `;
        return container;
    }
}