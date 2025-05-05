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
                                    <textarea type="text" name="qualifications-and-requirements" id="qualifications-and-requirements" rows="6" cols="50"></textarea>
                                </div>
                        
                                <div class="post-form">
                                    <label for="compensation">Compensation</label>
                                    <input type="text" name="compensation" id="compensation">
                                </div>
                        
                                <div class="post-form">
                                    <label for="hiring-period">Hiring Period</label>
                                    <input type="text" name="hiring-period" id="hiring-period">
                                </div>
                        
                                <div class="post-form">
                                    <label for="application-instructions">Application Instructions</label>
                                    <textarea type="text" name="application-instructions" id="application-instructions" rows="6" cols="50"></textarea>
                                </div>
                        
                                <div class="post-form">
                                    <label for="deadline">Application Deadline</label>
                                    <input type="date" name="deadline" id="deadline">
                                </div>

                                <div class="buttons">
                                    <button type="button" id="back1">Back</button>
                                    <button type="button" id="next2">Next</button>
                                </div>
                            `;
        return container;
    }
}