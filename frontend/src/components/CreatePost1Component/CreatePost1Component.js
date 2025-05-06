import { BaseComponent } from "../BaseComponent/BaseComponent.js";

export class CreatePost1Component extends BaseComponent {
    constructor() {
        super();
    }

    render() {
        const container = document.createElement("div");
        container.classList.add("step");
        container.id = "step1";
        container.innerHTML = ` <div class="post-form">

                                    <label for="unique-id">Unique ID</label>
                                    <input type="text" name="unique-id" id="unique-id" data-optional>

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
                            `;
        return container;
    }
}

//         container.innerHTML = ` <div class="mode-toggle">
//                                     <label for="mode-toggle">Mode:</label>
//                                     <select id="mode-toggle">
//                                         <option value="create" selected>Create</option>
//                                         <option value="edit">Edit</option>
//                                     </select>
//                                     <input type="hidden" id="mode" name="mode" value="create">

//                                 </div>

//                                 <div class="post-form">
//                                     <label for="unique-id">Unique ID</label>
//                                     <input type="text" name="unique-id" id="unique-id" data-optional>
//                                 </div>

//                                 <div class="post-form">
//                                     <label for="title">Title</label>
//                                     <input type="text" name="title" id="title">
//                                 </div>
                        
//                                 <div class="post-form">
//                                     <label for="description">Research Description</label>
//                                     <textarea type="text" name="description" id="description" rows="6" cols="50"></textarea>
//                                 </div>
                        
//                                 <div class="post-form">
//                                     <label for="responsibilities">Role Responsibilities</label>
//                                     <textarea type="text" name="responsibilities" id="responsibilities" rows="6" cols="50"></textarea>
//                                 </div>
//                                 <div class="buttons">
//                                     <button type="button" id="next1">Next</button>
//                                     <button type="button" id="delete">Delete</button>
//                                 </div>
//                             `;