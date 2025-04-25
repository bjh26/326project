import express from "express";

const app = express();
const PORT = 3000;


app.use(express.static("../frontend/src/NewUserCreation"));
app.use(express.static("../frontend/src/assets"));
app.use(express.json());


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// use an array of objects to store individual profiles
let profiles = [];

app.post("/profile", (req, res) => { 
    const profile = req.body; 
    // check if email already exists
    if(profiles.some(p => p.email === profile.email)){
        return res.status(400).json({ error: "A profile with this email already exists." });
    }
    console.log(profile.profileImage)
    const toAdd = Profile(profile.firstName, profile.lastName, profile.email, false, profile.bio, profile.profileImage, profile.resume);
    profiles.push(toAdd);
    console.log(profiles);
    res.sendStatus(200);
});

app.delete("/profile/:id", (req, res) => {
    const profile = req.body;
    profiles = profiles.filter(p => p.email !== profile.email);
    res.sendStatus(200);
    console.log(profiles);
});

/**
 * @param {string} firstName - user's first name 
 * @param {string} lastName - user's last name
 * @param {string} email - user's school email
 * @param {boolean} displayEmail - whether the user wants to display their email
 * @param {string} bio - user's bio
 * @param {Object[]} researchItems - research areas/experiences user had/have 
 */
const Profile = (firstName, lastName, email, displayEmail=false, bio, researchItems = []) => (
    {
        firstName: firstName,
        lastName: lastName,
        email: email,
        displayEmail: displayEmail,
        bio: bio,
        // will add when server is big enough
        // profileImage: profileImage,
        // resume: resume,
        researchItems: researchItems
    }
);