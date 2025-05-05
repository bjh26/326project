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


// USER 
// Adds newly created user to database
// app.post("/profile", async (req, res) => { 
//     const profile = req.body; 
//     // check if email already exists
//     if(await userModel.findOne({where: {email: profile.email}}) !== null){
//         return res.status(400).json({ error: "A profile with this email already exists." });
//     }
//     // if(profiles.some(p => p.email === profile.email)){   
//     // }
//     console.log(profile.profileImage);
//     console.log(await userModel.create({
//         firstName: profile.firstName,
//         lastName: profile.lastName,
//         email: profile.email,
//         bio: profile.bio,
//         img: profile.profileImage,
//         resume: profile.resume
//     }));
//     // profiles.push(toAdd);
//     // console.log(profiles);
//     res.sendStatus(200);
// });

// // fetches user from database
// app.get("/profile/:id", async (request, response) => {
//     // use the given id to find the corresponding user's profile info (stored in memory for now -- will switch to SQLite next milestone)
//     // send that profile info as JSON in the response
//     const id = request.params.id; // use email as id
//     const userProfile = await userModel.findOne({where: {email: id}}); // const userProfile = profiles.find(profile => profile.email === id);
//     if (userProfile) { // if there's a user with that id
//         response.json(userProfile);
//     } else {
//         response.status(404).json({message: "User not found."});
//     }
// });

// // updates user info in database
// app.put("/profile/:id", async (request, response) => {
//     // use the given id to find the corresponding user's profile info (stored in memory for now -- will switch to SQLite next milestone)
//     // update that profile info based on the request body
//     const id = request.params.id; // use email as id
//     const updatedProfile = request.body;
//     const findProfile = await userModel.findOne({where: {email: id}});
//     if (findProfile === null) { return response.status(404).json({message: "User not found"}); }
//     await findProfile.update({
//         firstName: updatedProfile.firstName,
//         lastName: updatedProfile.lastName,
//         email: updatedProfile.email,
//         bio: updatedProfile.bio,
//         img: updatedProfile.profileImage,
//         resume: updatedProfile.resume
//     }); 
//     response.json({message: "Profile updated successfully"});
// });

// // POST 
// app.post('/researchPost', async (request, response) => {
//     const newPost = request.body;
//     // add a check here if you want to make sure there are no duplicate postings
//     await postModel.create({
//         title: newPost.title,
//         description: newPost.description,
//         contactEmail: newPost.contactEmail,
//         responsibilities: newPost.responsibilities,
//         qualifications: newPost.qualifications,
//         compensation: newPost.compensation,
//         hiringPeriod: newPost.hiringPeriod,
//         applicationInstructions: newPost.applicationInstructions,
//         deadline: newPost.deadline,
//         contactName: newPost.contactName,
//         contactEmail: newPost.contactEmail
//     }); 
//     response.json({message: "Profile updated successfully"});
// });

// app.put('/researchPost/:id', async (request, response) => {
//     const id = request.params.contactEmail;
//     const editedPost = request.body; 
//     // what's the unique id? def not email so double check @Elizabeth
//     const findPost = await postModel.findOne({where: {contactEmail: id}}); 
//     if (findPost !== null) { return response.status(404).json({message: "Post already exists"}); }
//     await findPost.update({
//         title: editedPost.title,
//         description: editedPost.description,
//         contactEmail: editedPost.contactEmail,
//         responsibilities: editedPost.responsibilities,
//         qualifications: editedPost.qualifications,
//         compensation: editedPost.compensation,
//         hiringPeriod: editedPost.hiringPeriod,
//         applicationInstructions: editedPost.applicationInstructions,
//         deadline: editedPost.deadline,
//         contactName: editedPost.contactName,
//         contactEmail: editedPost.contactEmail
//     }); 
//     response.json(editedPost);
// });

// app.delete('/researchPost/:id', async (request, response) => {
//     const id = request.params.contactEmail;
//     // what's the unique id? def not email so double check @Elizabeth
//     // if there is no unique id what are the set of attributes that will find the unique posting?
//     // important because we might be destroying more than we intend to in the current set up
//     const findPost = await postModel.findOne({where: {contactEmail: id}});
//     await findPost.destroy({where: {contactEmail: id}});
// });

// // @Khang please fill this out yourself 
// app.get('/api/posts', async (req, res) => {
//     try {
//         const posts = await postModel.findAll();
        
//         // Format posts for frontend
//         const formattedPosts = posts.map(post => {
//             const postData = post.get({ plain: true });
//             const formattedPost = formatPostForFrontend(postData);
            
//             // Convert dates to ISO strings for JSON transmission
//             return {
//                 ...formattedPost,
//                 postedDate: formattedPost.postedDate.toISOString(),
//                 deadline: formattedPost.deadline.toISOString(),
//                 hiringPeriodStart: formattedPost.hiringPeriodStart.toISOString(),
//                 hiringPeriodEnd: formattedPost.hiringPeriodEnd.toISOString(),
//             };
//         });
        
//         res.json(formattedPosts);
//     } catch (error) {
//         console.error('Error fetching posts:', error);
//         res.status(500).json({ message: 'Error fetching posts', error: error.message });
//     }
// });

// // GET a specific research post by ID
// app.get('/api/posts/:id', async (req, res) => {
//     try {
//         const postId = parseInt(req.params.id);
//         const post = await postModel.findByPk(postId);
        
//         if (!post) {
//             return res.status(404).json({ message: 'Research opportunity not found' });
//         }
        
//         // Format post for frontend
//         const postData = post.get({ plain: true });
//         const formattedPost = formatPostForFrontend(postData);
        
//         // Convert Date objects to ISO strings for JSON transmission
//         const postForJson = {
//             ...formattedPost,
//             postedDate: formattedPost.postedDate.toISOString(),
//             deadline: formattedPost.deadline.toISOString(),
//             hiringPeriodStart: formattedPost.hiringPeriodStart.toISOString(),
//             hiringPeriodEnd: formattedPost.hiringPeriodEnd.toISOString(),
//         };
        
//         res.json(postForJson);
//     } catch (error) {
//         console.error('Error fetching post:', error);
//         res.status(500).json({ message: 'Error fetching post', error: error.message });
//     }
// });

// // GET all unique majors with their post counts
// app.get('/api/majors', async (req, res) => {
//     try {
//         const posts = await postModel.findAll();
//         const majorCounts = {};

//         posts.forEach(post => {
//             const qualifications = post.qualificationRequirement || [];
            
//             qualifications.forEach(line => {
//                 umassMajors.forEach(major => {
//                     if (line.includes(major)) {
//                         if (!majorCounts[major]) {
//                             majorCounts[major] = 0;
//                         }
//                         majorCounts[major]++;
//                     }
//                 });
                
//                 Object.keys(umassMajorAbbreviations).forEach(abbr => {
//                     if (line.includes(abbr)) {
//                         const fullMajor = umassMajorAbbreviations[abbr];
//                         if (!majorCounts[fullMajor]) {
//                             majorCounts[fullMajor] = 0;
//                         }
//                         majorCounts[fullMajor]++;
//                     }
//                 });
//             });
//         });

//         res.json(majorCounts);
//     } catch (error) {
//         console.error('Error fetching majors:', error);
//         res.status(500).json({ message: 'Error fetching majors', error: error.message });
//     }
// });

// // SSE endpoint for real-time updates
// app.get('/api/updates', (req, res) => {
//     // Set headers for SSE
//     res.writeHead(200, {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         'Connection': 'keep-alive'
//     });
    
//     // Send initial connection message
//     res.write(`data: ${JSON.stringify({ type: 'connection', message: 'Connected to updates stream' })}\n\n`);
    
//     // Add client to connected clients
//     const clientId = Date.now();
//     const newClient = {
//         id: clientId,
//         response: res
//     };
    
//     sseClients.push(newClient);
    
//     // Handle client disconnect
//     req.on('close', () => {
//         const index = sseClients.findIndex(client => client.id === clientId);
//         if (index !== -1) {
//             sseClients.splice(index, 1);
//             console.log(`Client ${clientId} disconnected, ${sseClients.length} clients remaining`);
//         }
//     });
// });

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

