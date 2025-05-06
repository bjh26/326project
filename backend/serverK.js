// backend/server.js - Main Express server file

import {umassMajors, umassMajorAbbreviations} from '../frontend/src/assets/majors.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Post } from '../frontend/src/lib/models/Post.js'; // Import the Post class

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the frontend directory
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));
app.use('/src/pages/HomePage', express.static(path.join(__dirname, '../frontend/src/pages/HomePage')));
app.use('/src/components/JobListings', express.static(path.join(__dirname, '../frontend/src/components/JobListings')));
app.use('/src/components/JobDetails', express.static(path.join(__dirname, '../frontend/src/components/JobDetails')));
app.use('/src/components/NavBar', express.static(path.join(__dirname, '../frontend/src/components/NavBar')));
app.use('/src/components/SearchBar', express.static(path.join(__dirname, '../frontend/src/components/SearchBar')));

// In-memory data store (will be replaced with SQLite in next milestone)
let researchPosts = [
    {
        id: 1,
        title: "Software Engineering Research Assistant",
        description: "We are seeking a motivated undergraduate student to assist in a cutting-edge software engineering research project.",
        responsibilities: [
            "Assist in software engineering research and development.",
            "Collaborate with team members to analyze project requirements.",
            "Document research findings and progress."
        ],
        qualification_requirement: [
            "Undergraduate student in Computer Science or Software Engineering.",
            "Basic knowledge of programming languages like JavaScript or Python.",
            "Strong analytical and problem-solving skills."
        ],
        compensation: "$15/hour",
        hiring_period: { start: new Date("2024-01-15"), end: new Date("2024-05-30") },
        application_instructions: "Submit your resume and a brief cover letter to Prof. Emily Rodriguez.",
        deadline: new Date("2024-02-15"),
        contact_name: "Emily Rodriguez",
        contact_email: "emily.rodriguez@university.edu",
        postedDate: new Date("2023-11-01")
    },
    {
        id: 2,
        title: "Machine Learning Research Position",
        description: "Join our team to work on cutting-edge machine learning algorithms.",
        responsibilities: [
            "Develop and optimize machine learning models.",
            "Analyze datasets to extract meaningful insights.",
            "Collaborate with researchers to publish findings."
        ],
        qualification_requirement: [
            "Undergraduate or graduate student in Computer Science, Data Science, or AI.",
            "Experience with Python and machine learning libraries.",
            "Strong mathematical foundation in statistics and linear algebra."
        ],
        compensation: "$18/hour",
        hiring_period: { start: new Date("2024-02-01"), end: new Date("2024-06-15") },
        application_instructions: "Send your application to Prof. Michael Chang via email.",
        deadline: new Date("2024-02-20"),
        contact_name: "Michael Chang",
        contact_email: "michael.chang@university.edu",
        postedDate: new Date("2023-10-25")
    },
    {
        id: 3,
        title: "AI Research Opportunity",
        description: "Help develop AI models for natural language processing.",
        responsibilities: [
            "Design and implement NLP models.",
            "Evaluate model performance and suggest improvements.",
            "Prepare technical documentation and reports."
        ],
        qualification_requirement: [
            "Background in Artificial Intelligence or Computer Science.",
            "Experience with NLP frameworks and tools.",
            "Strong programming skills in Python."
        ],
        compensation: "$17/hour",
        hiring_period: { start: new Date("2024-01-20"), end: new Date("2024-05-20") },
        application_instructions: "Apply online through the university's research portal.",
        deadline: new Date("2024-02-10"),
        contact_name: "Sarah Johnson",
        contact_email: "sarah.johnson@university.edu",
        postedDate: new Date("2023-10-15")
    },
    {
        id: 4,
        title: "Software Development Research",
        description: "Work on innovative software development methodologies.",
        responsibilities: [
            "Research and develop new software development techniques.",
            "Collaborate with the team to test and validate methodologies.",
            "Document and present research outcomes."
        ],
        qualification_requirement: [
            "Student in Software Engineering or Computer Engineering.",
            "Experience with software development tools and practices.",
            "Strong teamwork and communication skills."
        ],
        compensation: "$16/hour",
        hiring_period: { start: new Date("2024-02-10"), end: new Date("2024-06-01") },
        application_instructions: "Submit your application to Prof. David Wilson via email.",
        deadline: new Date("2024-02-25"),
        contact_name: "David Wilson",
        contact_email: "david.wilson@university.edu",
        postedDate: new Date("2023-09-30")
    },
    {
        id: 5,
        title: "Software Engineering Research Assistant",
        description: "Assist in cutting-edge software development research with a focus on AI-driven solutions.",
        responsibilities: [
            "Conduct software engineering research and analysis.",
            "Develop prototypes for experimental software applications.",
            "Collaborate with research teams to document findings."
        ],
        qualification_requirement: [
            "Bachelor’s degree in Computer Science or related field.",
            "Experience with JavaScript, Python, or C++.",
            "Understanding of AI/ML fundamentals."
        ],
        compensation: "Competitive hourly wage or stipend.",
        hiring_period: { start: new Date("2025-05-01"), end: new Date("2025-08-31") },
        application_instructions: "Submit a resume and cover letter via our application portal.",
        deadline: new Date("2025-04-30"),
        contact_name: "Jane Doe",
        contact_email: "jane.doe@researchlab.edu",
        postedDate: new Date("2023-08-15")
    },
].map(post => new Post(
    post.id,
    post.title,
    post.description,
    post.responsibilities,
    post.qualification_requirement,
    post.compensation,
    post.hiring_period,
    post.application_instructions,
    post.deadline,
    post.contact_name,
    post.contact_email,
    post.postedDate
));

// Store connected SSE clients for real-time updates
const sseClients = [];

// API Routes

// GET all research posts
app.get('/api/posts', (req, res) => {
    // Convert Date objects to ISO strings for JSON transmission
    const postsForJson = researchPosts.map(post => ({
        ...post,
        postedDate: post.postedDate.toISOString(),
        deadline: post.deadline.toISOString(),
        hiring_period: {
            start: post.hiring_period.start.toISOString(),
            end: post.hiring_period.end.toISOString()
        }
    }));
    
    res.json(postsForJson);
});

// GET a specific research post by ID
app.get('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = researchPosts.find(p => p.id === postId);
    
    if (!post) {
        return res.status(404).json({ message: 'Research opportunity not found' });
    }
    
    // Convert Date objects to ISO strings for JSON transmission
    const postForJson = {
        ...post,
        postedDate: post.postedDate.toISOString(),
        deadline: post.deadline.toISOString(),
        hiring_period: {
            start: post.hiring_period.start.toISOString(),
            end: post.hiring_period.end.toISOString()
        }
    };
    
    res.json(postForJson);
});

// GET all unique majors with their post counts
app.get('/api/majors', (req, res) => {
    const majorCounts = {};

    researchPosts.forEach(post => {
        post.qualification_requirement.forEach(line => {
            umassMajors.forEach(major => {
                if (line.includes(major)) {
                    if (!majorCounts[major]) {
                        majorCounts[major] = 0;
                    }
                    majorCounts[major]++;
                }
            });
            Object.keys(umassMajorAbbreviations).forEach(abbr => {
                if (line.includes(abbr)) {
                    const fullMajor = umassMajorAbbreviations[abbr];
                    if (!majorCounts[fullMajor]) {
                        majorCounts[fullMajor] = 0;
                    }
                    majorCounts[fullMajor]++;
                }
            });
        });
    });

    res.json(majorCounts);
});

// SSE endpoint for real-time updates
app.get('/api/updates', (req, res) => {
    // Set headers for SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connection', message: 'Connected to updates stream' })}\n\n`);
    
    // Add client to connected clients
    const clientId = Date.now();
    const newClient = {
        id: clientId,
        response: res
    };
    
    sseClients.push(newClient);
    
    // Handle client disconnect
    req.on('close', () => {
        const index = sseClients.findIndex(client => client.id === clientId);
        if (index !== -1) {
            sseClients.splice(index, 1);
            console.log(`Client ${clientId} disconnected, ${sseClients.length} clients remaining`);
        }
    });
});

// POST new post
app.post('/api/posts', (req, res) => {
    // Validate required fields
    const requiredFields = ['title', 'description', 'responsibilities', 'qualification_requirement', 'compensation', 'hiring_period', 'application_instructions', 'deadline', 'contact_name', 'contact_email'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
        return res.status(400).json({ 
            message: 'Missing required fields', 
            fields: missingFields 
        });
    }
    
    // Create new post
    const newPost = {
        id: researchPosts.length > 0 ? Math.max(...researchPosts.map(p => p.id)) + 1 : 1,
        title: req.body.title,
        description: req.body.description,
        responsibilities: req.body.responsibilities,
        qualification_requirement: req.body.qualification_requirement,
        compensation: req.body.compensation,
        hiring_period: req.body.hiring_period,
        application_instructions: req.body.application_instructions,
        deadline: req.body.deadline,
        contact_name: req.body.contact_name,
        contact_email: req.body.contact_email,
        postedDate: req.body.postedDate, // Set current date as posted date
    };
    
    // Add to in-memory array
    researchPosts.push(newPost);
    
    // Notify connected clients about the new post
    notifyClientsAboutUpdate('new_post', newPost);
    
    // Return the created post
    res.status(201).json(newPost);
});

// Function to notify all connected clients about updates
function notifyClientsAboutUpdate(updateType, data) {
    if (sseClients.length === 0) return;
    
    const updateData = {
        type: updateType,
        timestamp: new Date().toISOString(),
        data: data
    };
    
    const eventData = `data: ${JSON.stringify(updateData)}\n\n`;
    
    sseClients.forEach(client => {
        client.response.write(eventData);
    });
    
    console.log(`Notified ${sseClients.length} clients about ${updateType}`);
}

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app; // Export the app for testing purposes