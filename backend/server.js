import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static("../frontend/src"));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// const profiles = []; // array of objects where each object corresponds to a user's profile
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

app.get("/profile/:id", (request, response) => {
    // use the given id to find the corresponding user's profile info (stored in memory for now -- will switch to SQLite next milestone)
    // send that profile info as JSON in the response
    const id = request.params.id; // use email as id
    const userProfile = profiles.find(profile => profile.email === id);
    if (userProfile) { // if there's a user with that id
        response.json(userProfile);
    } else {
        response.status(404).json({message: "User not found"});
    }
});

app.put("/profile/:id", (request, response) => {
    // use the given id to find the corresponding user's profile info (stored in memory for now -- will switch to SQLite next milestone)
    // update that profile info based on the request body
    const id = request.params.id; // use email as id
    const updatedProfile = request.body;

    const userProfileIndex = profiles.findIndex(profile => profile.email === id);
    if (userProfileIndex !== -1) { // if there's a user with that id
        profiles[userProfileIndex] = updatedProfile;
        response.json({message: "Profile updated successfully"});
    } else {
        response.status(404).json({message: "User not found"});
    }
});

app.post("/profile", (req, res) => { 
    const profile = req.body; 
    // check if email already exists
    if(profiles.some(p => p.email === profile.email)){
        return res.status(400).json({ error: "A profile with this email already exists." });
    }
    profiles.push(profile);
    console.log(profiles);
    res.sendStatus(200);
});

const posts = [];

app.post("/researchPost", (req, res) => { 
    const post = req.body; 
    // check if email already exists
    if(profiles.some(p => p.email === post.email)){
        return res.status(400).json({ error: "A profile with this email already exists." });
    }
    posts.push(post);
    console.log(posts);
    res.sendStatus(200);
});