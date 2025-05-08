import { AppControllerComponent } from "./components/AppControllerComponent/AppControllerComponent.js";
import { LocalDB } from "./services/LocalDB.js";

// open local DB (uses IndexedDB)
await LocalDB.open();

// create an instance of AppControllerComponent
const appController = new AppControllerComponent();

// render the component in the #app container
const appContainer = document.getElementById("app");
appContainer.appendChild(await appController.render());