import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class CreatePost1Component extends BaseComponent {
    constructor() {
        super();
    }

    render() {
        this.loadCSS("components/CreatePost1Component", "style");
        const container = document.createElement("div");
        container.classList.add("step");
        container.classList.add("active");
        container.id = "step1";
        container.innerHTML = ` <div class="post-form">
                                    <label for="title">Title</label>
                                    <input type="text" name="title" id="title">

                                    <label for="description">Research Description</label>
                                    <textarea type="text" name="description" id="description" rows="6" cols="50"></textarea>

                                    <label for="responsibilities">Role Responsibilities</label>
                                    <textarea type="text" name="responsibilities" id="responsibilities" rows="6" cols="50"></textarea>
                                </div>
                                <div class="buttons">
                                    <input type="button" class="form-button" id="cancel" value="Cancel">
                                    <input type="button" class="form-button" id="save" value="Save">
                                    <input type="button" class="form-button" id="next" value="Next">
                                </div>
                                <div id="saveMessage" class="save-message"></div>
                            `;
        return container;
    }
}