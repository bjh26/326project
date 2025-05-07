import { postModel, formatPostForFrontend } from "../models/postModel.js";
import { umassMajors, umassMajorAbbreviations } from "../../frontend/src/assets/majors.js";

// Store connected SSE clients for real-time updates
const sseClients = [];

// Get all research posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.findAll();
        
        // Format posts for frontend
        const formattedPosts = posts.map(post => {
            const postData = post.get({ plain: true });
            const formattedPost = formatPostForFrontend(postData);
            
            // Convert dates to ISO strings for JSON transmission
            return {
                ...formattedPost,
                postedDate: formattedPost.postedDate ? formattedPost.postedDate.toISOString() : null,
                deadline: formattedPost.deadline ? formattedPost.deadline.toISOString() : null,
                hiringPeriodStart: formattedPost.hiringPeriodStart ? formattedPost.hiringPeriodStart.toISOString() : null,
                hiringPeriodEnd: formattedPost.hiringPeriodEnd ? formattedPost.hiringPeriodEnd.toISOString() : null,
            };
        });
        
        res.json(formattedPosts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

// Get a specific research post by ID
export const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await postModel.findByPk(postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Research opportunity not found' });
        }
        
        // Format post for frontend
        const postData = post.get({ plain: true });
        const formattedPost = formatPostForFrontend(postData);
        
        // Convert Date objects to ISO strings for JSON transmission
        const postForJson = {
            ...formattedPost,
            postedDate: formattedPost.postedDate ? formattedPost.postedDate.toISOString() : null,
            deadline: formattedPost.deadline ? formattedPost.deadline.toISOString() : null,
            hiringPeriodStart: formattedPost.hiringPeriodStart ? formattedPost.hiringPeriodStart.toISOString() : null,
            hiringPeriodEnd: formattedPost.hiringPeriodEnd ? formattedPost.hiringPeriodEnd.toISOString() : null,
        };
        
        res.json(postForJson);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};

export const getPostCount = async (req, res) => {
    try {
        const count = await postModel.count();
        res.json({ count });
    } catch (error) {
        console.error('Error fetching post count:', error);
        res.status(500).json({ message: 'Error fetching post count', error: error.message });
    }
};

// Get all unique majors with their post counts
export const getAllMajors = async (req, res) => {
    try {
        const posts = await postModel.findAll();
        const majorCounts = {};

        posts.forEach(post => {
            const qualifications = post.qualificationRequirement || [];
            
            qualifications.forEach(line => {
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
    } catch (error) {
        console.error('Error fetching majors:', error);
        res.status(500).json({ message: 'Error fetching majors', error: error.message });
    }
};

// Create a new research post
export const createPost = async (req, res) => {
    try {
        const newPost = req.body;
        // Add validation if needed
        
        await postModel.create({
            title: newPost.title,
            description: newPost.description,
            responsibilities: newPost.responsibilities,
            qualificationRequirement: newPost.qualificationRequirement,
            compensation: newPost.compensation,
            hiringPeriodStart: newPost.hiringPeriodStart,
            hiringPeriodEnd: newPost.hiringPeriodEnd,
            applicationInstructions: newPost.applicationInstructions,
            deadline: newPost.deadline,
            contactName: newPost.contactName,
            contactEmail: newPost.contactEmail
        });
        
        // Notify connected clients
        notifyClientsAboutUpdate('new_post', newPost);
        
        res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

// Update an existing research post
export const updatePost = async (req, res) => {
    try {
        const id = req.params.id;
        const editedPost = req.body;
        
        const findPost = await postModel.findByPk(id);
        if (!findPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        await findPost.update({
            title: editedPost.title,
            description: editedPost.description,
            responsibilities: editedPost.responsibilities,
            qualificationRequirement: editedPost.qualificationRequirement,
            compensation: editedPost.compensation,
            hiringPeriodStart: editedPost.hiringPeriodStart,
            hiringPeriodEnd: editedPost.hiringPeriodEnd,
            applicationInstructions: editedPost.applicationInstructions,
            deadline: editedPost.deadline,
            contactName: editedPost.contactName,
            contactEmail: editedPost.contactEmail
        });
        
        res.json({ message: "Post updated successfully" });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Error updating post', error: error.message });
    }
};

// Delete a research post
export const deletePost = async (req, res) => {
    try {
        const id = req.params.id;
        
        const findPost = await postModel.findByPk(id);
        if (!findPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        await findPost.destroy();
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};

// SSE endpoint for real-time updates
export const getUpdates = (req, res) => {
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
};

// Helper function to notify clients about updates
export const notifyClientsAboutUpdate = (updateType, data) => {
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
};