import express from "express";
import { sequelizeUser, userModel } from "./userModel.js";
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

app.use('/src', express.static(path.join(__dirname, '../frontend/src')));
app.use('/src/pages/HomePage', express.static(path.join(__dirname, '../frontend/src/pages/HomePage')));
app.use('/src/components/JobListings', express.static(path.join(__dirname, '../frontend/src/components/JobListings')));
app.use('/src/components/JobDetails', express.static(path.join(__dirname, '../frontend/src/components/JobDetails')));
app.use('/src/components/NavBar', express.static(path.join(__dirname, '../frontend/src/components/NavBar')));
app.use('/src/components/SearchBar', express.static(path.join(__dirname, '../frontend/src/components/SearchBar')));
app.use(express.static("../frontend/src/EditPages"));
app.use(express.static("../frontend/src/CreateAPostPages"));
app.use(express.static("../frontend/src/NewUserCreation"));
app.use(express.static("../frontend/src/assets"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        console.log(test)
        console.log('data imported...')

        seedResearchPosts(); // Add in mock data for research posts

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Error during preloadData:', err);
    }
}

preloadData();

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

