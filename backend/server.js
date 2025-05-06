import express from "express";
import { sequelizeUser, userModel } from "./models/userModel.js";
import { sequelizePost, seedResearchPosts} from "./models/postModel.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

// test function with dummy data
async function preloadData() {
    try {
        await sequelizeUser.sync({force:true});
        console.log('importing data...')
        const test = await userModel.create({
            firstName: 'blair',
            lastName: 'huang',
            email: 'bjhuang@umass.edu',
            bio: 'umass 25',
            img: 'not yet defined',
            resume: 'not yet defined'
        });

        seedResearchPosts(); // Add in mock data for research posts

        
    } catch (err) {
        console.error('Error during preloadData:', err);
    }
}

preloadData();

setTimeout(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}, 500);


// API routes
app.use('/researchPost', postRoutes);
app.use('/profile', userRoutes);

const profiles = 
[
    {
      type: 'profileData',
      researchItems: [],
      firstName: 'Nishil',
      lastName: 'Adina',
      email: 'nadina@umass.edu',
      displayEmail: true,
      department: 'Computer Science',
      bio: 'hi'
    }
]; // fake data to start with

const Profile = (firstName, lastName, email, displayEmail, bio, researchItems) => ({
    firstName,
    lastName,
    email,
    displayEmail,
    bio,
    researchItems,
}); // returns an object containing each field
// this is just how the profile object is structured

