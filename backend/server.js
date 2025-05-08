import express from "express";
import { sequelizeUser, userModel } from "./models/userModel.js";
import { sequelizePost, seedResearchPosts} from "./models/postModel.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { LocalDB } from "../frontend/src/services/LocalDB.js";

import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// instantiate Express
const app = express();
const PORT = 3000;
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static("../frontend/src"));

// clear IndexedDB if it contains anything
// this is done in the server file, so this line only runs when server is started (doesn't run when refreshing page) 
try {
    await LocalDB.clear();
    console.log("cleared IndexedDB");
} catch (error) {
    console.log("Did not clear IndexedDB.", error.message);
}

// test function with dummy data
async function preloadData() {
    try {
        await sequelizeUser.sync({force:true});
        console.log('importing data...');
        seedResearchPosts(); // Add in mock data for research posts        
    } catch (err) {
        console.error('Error during preloadData:', err);
    }
}

preloadData(); // populate with mock research posts

// timeout to wait for initial output in terminal before outputting link
setTimeout(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}, 500);


// API routes
app.use('/researchPost', postRoutes);
app.use('/profile', userRoutes);