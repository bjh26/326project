import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class Edit2Component extends BaseComponent {
    constructor() {
        super();
    }

    render() {
        this.loadCSS("components/Edit2Component", "style");
        const container = document.createElement("div");
        container.classList.add("form");
        container.id = "info-form";
        container.innerHTML = ` <h1>Upload Profile Picture and Resume</h1>
                                <div class="upload-container">
                                    <div class="upload-group">
                                        <label for="profilePictureArea" class="upload-label">Profile Picture</label>
                                        <div id="profilePictureArea" class="upload-input">
                                            <p>Drag & drop your file here, or <span id="pfpFileSelect" class="file-select">browse</span></p>
                                            <input type="file" id="profilePictureInput" accept="image/*" hidden>
                                        </div>
                                    </div>
                                
                                    <div class="upload-group">
                                        <label for="resumeArea" class="upload-label">Resume</label>
                                        <div id="resumeArea" class="upload-input">
                                            <p>Drag & drop your file here, or <span id="resumeFileSelect" class="file-select">browse</span></p>
                                            <input type="file" id="resumeInput" accept="application/pdf" hidden>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-actions">
                                    <input type="button" id="save" class="save-button button" value="Save">
                                    <input type="submit" id="finish" class="next-button button" value="Exit & Publish Changes">
                                    <input type="submit" id="back" class="next-button button" value="Back">
                                    <input type="submit" id="next" class="next-button button" value="Next">
                                </div>
                                <div id="saveMessage" class="save-message"></div>
                            `;
        return container;
    }
}