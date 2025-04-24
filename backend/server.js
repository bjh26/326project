import express from "express";

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const profiles = []; // array of objects where each object corresponds to a user's profile

const Profile = (firstName, lastName, email, displayEmail, bio, researchItems) => ({
    firstName,
    lastName,
    email,
    displayEmail,
    bio,
    researchItems,
}); // returns an object containing each field

app.get("/profile/:id", (request, response) => {
    // use the given id to find the corresponding user's profile info (stored in memory for now -- will switch to SQLite next milestone)
    // send that profile info as JSON in the response
    const id = request.params.id;
    const userProfile = profiles.find(profile => profile.email === id);
    if (userProfile) { // if there's a user with that id
        response.json(userProfile);
    } else {
        response.status(404).json({message: "User not found"});
    }
});

app.get("/profile", (request, response) => {
    const profile = request.body;
    profiles.push(profile);
    response.json({message: "Success"});
})