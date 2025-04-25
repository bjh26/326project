import express from "express";

const app = express();
const PORT = 3000;

app.use(express.static("../frontend/src/EditPages"));
app.use(express.json());

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
    const id = request.params.id; // use email as id
    const userProfile = profiles.find(profile => profile.email === id);
    if (userProfile) { // if there's a user with that id
        response.json(userProfile);
    } else {
        response.status(404).json({message: "User not found"});
    }
});

app.post("/profile", (request, response) => {
    const profile = request.body;

    // save to in-memory array
    const userProfileIndex = profiles.findIndex(p => p.email === profile.email);
    if (userProfileIndex === -1) { // user's profile is not already stored
        console.log("not found, making new");
        profiles.push(profile);
    } else { // update the user's profile
        console.log("found and overwriting");
        profiles[userProfileIndex] = profile;
    }

    console.log("all profiles:\n", profiles);

    response.json({message: "Success"});
});