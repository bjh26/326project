import { DataBase } from "../services/DataBase.js";
import { AppController } from "./AppController.js";

const objStoreName = "storage";

// Open the database and define object stores
await DataBase.open("MyDB", 1, (db) => {
    if (!db.objectStoreNames.contains(objStoreName)) {
        db.createObjectStore(objStoreName, { keyPath: "type" });
    }
});

// // Use the wrapper to interact with the "tasks" store
// await DataBase.add("tasks", { id: 1, title: "Write docs" });
// const task = await DataBase.get("tasks", 1);
// console.log(task); // { id: 1, title: "Write docs" }

// await DataBase.put("view", { id: 1, title: "main" });

let page = await DataBase.get(objStoreName, "currentPage"); // undefined, "main", "edit1", "edit2", or "edit3"

if (!page) { // if undefined, default to "main"
    console.log("Page not found, defaulting to main.");
    page = "main";
    await DataBase.put(objStoreName, { type: "currentPage", title: "main" });
} else {
    page = page.title;
}

const app = new AppController(document);

app.loadPage("edit1");


