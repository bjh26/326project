import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class CreatePost2Component extends BaseComponent {
    constructor() {
        super();
    }

    render() {
        const container = document.createElement("div");
        container.classList.add("step");
        container.id = "step2";
        container.innerHTML = ` <div class="post-form">

                                    <label for="qualifications-and-requirements">Qualifications and Requirements</label>
                                    <textarea type="text" name="qualifications" id="qualifications" rows="6" cols="50"></textarea>
                        
                                    <label for="compensation">Compensation</label>
                                    <input type="text" name="compensation" id="compensation">
                        
                                    <label for="hiring-period">Hiring Period</label>
                                    <input type="text" name="hiring-period" id="hiring-period">
                        
                                    <label for="application-instructions">Application Instructions</label>
                                    <textarea type="text" name="instructions" id="instructions" rows="6" cols="50"></textarea>
                        
                                    <label for="deadline">Application Deadline</label>
                                    <input type="date" name="deadline" id="deadline">

                                </div>

                                <div class="buttons">
                                    <input type="button" class="form-button" id="cancel" value="Cancel">
                                    <input type="button" class="form-button" id="save" value="Save">
                                    <input type="button" class="form-button" id="back" value="Back">
                                    <input type="button" class="form-button" id="next" value="Next">
                                </div>
                            `;
        return container;
    }
}