import express from "express";
import { sequelizeUser, userModel } from "./userModel.js";
import { sequelizePost, postModel } from "./postModel.js";
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

        await sequelizePost.sync({force:true});
        await postModel.create({
            title: 'example posting',
            description: 'human experiment',
            contactEmail: 'bjhuang@umass.edu',
            responsibilities: 'show up',
            qualifications: 'preferably majoring in accounting',
            compensation: '$20/hr',
            contactName: 'blair',
        });

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Error during preloadData:', err);
    }
}

preloadData();

// USER 
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

// POST 
app.post('/researchPost', async (request, response) => {
    const newPost = request.body;
    // add a check here if you want to make sure there are no duplicate postings
    await postModel.create({
        title: newPost.title,
        description: newPost.description,
        contactEmail: newPost.contactEmail,
        responsibilities: newPost.responsibilities,
        qualifications: newPost.qualifications,
        compensation: newPost.compensation,
        hiringPeriod: newPost.hiringPeriod,
        applicationInstructions: newPost.applicationInstructions,
        deadline: newPost.deadline,
        contactName: newPost.contactName,
        contactEmail: newPost.contactEmail
    }); 
    response.json({message: "Profile updated successfully"});
});

app.put('/researchPost/:id', async (request, response) => {
    const id = request.params.contactEmail;
    const editedPost = request.body; 
    // what's the unique id? def not email so double check @Elizabeth
    const findPost = await postModel.findOne({where: {contactEmail: id}}); 
    if (findPost !== null) { return response.status(404).json({message: "Post already exists"}); }
    await findPost.update({
        title: editedPost.title,
        description: editedPost.description,
        contactEmail: editedPost.contactEmail,
        responsibilities: editedPost.responsibilities,
        qualifications: editedPost.qualifications,
        compensation: editedPost.compensation,
        hiringPeriod: editedPost.hiringPeriod,
        applicationInstructions: editedPost.applicationInstructions,
        deadline: editedPost.deadline,
        contactName: editedPost.contactName,
        contactEmail: editedPost.contactEmail
    }); 
    response.json(editedPost);
});

app.delete('/researchPost/:id', async (request, response) => {
    const id = request.params.contactEmail;
    // what's the unique id? def not email so double check @Elizabeth
    // if there is no unique id what are the set of attributes that will find the unique posting?
    // important because we might be destroying more than we intend to in the current set up
    const findPost = await postModel.findOne({where: {contactEmail: id}});
    await findPost.destroy({where: {contactEmail: id}});
});

// @Khang please fill this out yourself 
