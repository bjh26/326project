import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class CreatePost2Component extends BaseComponent {
    constructor() {
        super();
    }

    render() {
        this.loadCSS("components/CreatePost2Component", "style");
        const container = document.createElement("div");
        container.classList.add("step");
        container.classList.add("active");
        container.id = "step2";
        container.innerHTML = ` <div class="post-form">
                                    <label for="qualificationRequirement">Qualifications and Requirements <span class="required">*</span></label>
                                    <textarea type="text" name="qualificationRequirement" id="qualificationRequirement" rows="6" cols="50" required></textarea>
                        
                                    <label for="compensation">Compensation <span class="required">*</span></label>
                                    <input type="text" name="compensation" id="compensation" required>
                        
                                    <label for="hiringPeriodStart">Hiring Period Start <span class="required">*</span></label>
                                    <input type="date" name="hiringPeriodStart" id="hiringPeriodStart" required>
                                    
                                    <label for="hiringPeriodEnd">Hiring Period End <span class="required">*</span></label>
                                    <input type="date" name="hiringPeriodEnd" id="hiringPeriodEnd" required>
                        
                                    <label for="applicationInstructions">Application Instructions <span class="required">*</span></label>
                                    <textarea type="text" name="applicationInstructions" id="applicationInstructions" rows="6" cols="50" required></textarea>
                        
                                    <label for="deadline">Application Deadline <span class="required">*</span></label>
                                    <input type="date" name="deadline" id="deadline" required>
                                </div>

                                <div class="buttons">
                                    <input type="button" class="form-button" id="cancel" value="Cancel">
                                    <input type="button" class="form-button" id="save" value="Save">
                                    <input type="button" class="form-button" id="back" value="Back">
                                    <input type="button" class="form-button" id="next" value="Next">
                                </div>
                                <div id="saveMessage" class="save-message"></div>
                                <div class="form-help">Fields marked with <span class="required">*</span> are required</div>
                            `;
        return container;
    }
}