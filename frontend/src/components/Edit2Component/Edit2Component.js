import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class Edit2Component extends BaseComponent {
    constructor() {
        super();
    }

    render() {
        const container = document.createElement("div");
        container.classList.add("form");
        container.id = "info-form";
        container.innerHTML = ` <h1>Upload Profile Picture and Resume</h1>
                                <div class="upload-container">
                                    <div class="upload-group">
                                        <label for="profilePicture" class="upload-label">Profile Picture</label>
                                        <input type="file" id="profilePicture" class="upload-input" accept="image/*">
                                    </div>
                                
                                    <div class="upload-group">
                                        <label for="resumeFile" class="upload-label">Resume</label>
                                        <input type="file" id="resumeFile" class="upload-input" accept="application/pdf">
                                    </div>
                                </div>
                                <div class="form-actions">
                                    <div class="button-group">
                                        <input type="button" id="save" class="save-button button" value="Save">
                                        <span id="saveMessage" class="save-message"></span>
                                    </div>
                                    <input type="submit" id="next" class="next-button button" value="Next">
                                </div>
                            `;
        return container;
    }
}