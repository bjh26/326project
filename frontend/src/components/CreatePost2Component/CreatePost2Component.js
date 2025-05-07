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
                                    <label for="qualificationRequirement">Qualifications and Requirements</label>
                                    <textarea type="text" name="qualificationRequirement" id="qualificationRequirement" rows="6" cols="50"></textarea>
                        
                                    <label for="compensation">Compensation</label>
                                    <input type="text" name="compensation" id="compensation">
                        
                                    <label for="hiringPeriodStart">Hiring Period Start</label>
                                    <input type="date" name="hiringPeriodStart" id="hiringPeriodStart">
                                    
                                    <label for="hiringPeriodEnd">Hiring Period End</label>
                                    <input type="date" name="hiringPeriodEnd" id="hiringPeriodEnd">
                        
                                    <label for="applicationInstructions">Application Instructions</label>
                                    <textarea type="text" name="applicationInstructions" id="applicationInstructions" rows="6" cols="50"></textarea>
                        
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