import express from "express";
import { sequelize, userModel } from "./userModel.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

async function preloadData() {
    try {
        await sequelize.sync({force:true});
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
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Error during preloadData:', err);
    }
}

preloadData();

// Adds newly created user to database
app.post("/profile", async (req, res) => { 
    const profile = req.body; 
    // check if email already exists
    if(await userModel.findOne({where: {email: profile.email}}) !== null){
        return res.status(400).json({ error: "A profile with this email already exists." });
    }
    // if(profiles.some(p => p.email === profile.email)){   
    // }
    console.log(profile.profileImage);
    console.log(await userModel.create({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        bio: profile.bio,
        img: profile.profileImage,
        resume: profile.resume
    }));
    // profiles.push(toAdd);
    // console.log(profiles);
    res.sendStatus(200);
});

// fetches user from database
app.get("/profile/:id", async (request, response) => {
    // use the given id to find the corresponding user's profile info (stored in memory for now -- will switch to SQLite next milestone)
    // send that profile info as JSON in the response
    const id = request.params.id; // use email as id
    const userProfile = await userModel.findOne({where: {email: id}}); // const userProfile = profiles.find(profile => profile.email === id);
    if (userProfile) { // if there's a user with that id
        response.json(userProfile);
    } else {
        response.status(404).json({message: "User not found."});
    }
});

// updates user info in database
app.put("/profile/:id", async (request, response) => {
    // use the given id to find the corresponding user's profile info (stored in memory for now -- will switch to SQLite next milestone)
    // update that profile info based on the request body
    const id = request.params.id; // use email as id
    const updatedProfile = request.body;
    const findProfile = await userModel.findOne({where: {email: id}});
    if (findProfile === null) { return response.status(404).json({message: "User not found"}); }
    await findProfile.update({
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
        bio: updatedProfile.bio,
        img: updatedProfile.profileImage,
        resume: updatedProfile.resume
    }); 
    response.json({message: "Profile updated successfully"});
});

