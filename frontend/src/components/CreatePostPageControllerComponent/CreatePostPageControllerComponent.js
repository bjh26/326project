import { EventHub } from "../../eventhub/EventHub";
import { BaseComponent } from "../BaseComponent/BaseComponent";

export default class CreatePostPageControllerComponent extends BaseComponent {

    #hub;
    #currentPage;
    #postData;

    constructor() {
        super();

        this.#hub = EventHub.getInstance();
    }

    
}