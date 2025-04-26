import { DataBase } from "./DataBase.js";
import { AppController } from "./AppController.js";

const objStoreName = "storage";

// Open the database and define object stores
await DataBase.open("MyDB", 1, (db) => {
    if (!db.objectStoreNames.contains(objStoreName)) {
        db.createObjectStore(objStoreName, { keyPath: "type" });
    }
});

// Get current page from database, or default to "main"
let page = await DataBase.get(objStoreName, "currentPage");

if (!page) { // if undefined, default to "main"
    console.log("Page not found, defaulting to main.");
    page = "main";
    await DataBase.put(objStoreName, { type: "currentPage", title: "main" });
} else {
    page = page.title;
}

// Initialize app controller
const app = new AppController(document);

const emailOfRequestedProfile = "nadina@umass.edu"; // currently hardcoded but will eventually be a parameter
// eventually you'll be able to click on a person's name from a post they made and it will take you to their profile
// when clicked, it'll use that person's email to load their profile page

// Load the current page (which will also set up event listeners and load saved data)
if (page !== "main") {
    app.loadPage(page);
} else {
    // load the requested user's profile page
    app.loadDataFromServer(emailOfRequestedProfile);
}
