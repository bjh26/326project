// /frontend/src/services/PostService.js
// UNNECESSARY ANYMORE DONT USE THIS FILE
import { Post } from '../lib/models/Post.js';
import { EventHub, Events } from '../lib/EventHub/index.js';

export class PostService {
    constructor() {
        this.API_BASE_URL = '/researchPost'; // Base URL for API requests
        this.eventHub = EventHub.getInstance();
        this.cachedPosts = [];
        
        // Subscribe to events
        this.eventHub.subscribe(Events.LoadPosts, () => this.loadAllPosts());
        this.eventHub.subscribe(Events.LoadPost, (postId) => this.loadPostById(postId));
        this.eventHub.subscribe(Events.StorePost, (post) => this.storePost(post));
        this.eventHub.subscribe(Events.UnStorePosts, (postId) => this.unStorePost(postId));
    }

    // Load all posts from API
    async loadAllPosts() {
        try {
            const response = await fetch(`${this.API_BASE_URL}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch posts: ${response.statusText}`);
            }
            
            const postsData = await response.json();
            
            // Convert to Post objects
            this.cachedPosts = postsData.map(data => {
                return new Post(
                    data.id,
                    data.title,
                    data.professor,
                    data.salary,
                    data.period,
                    data.major,
                    data.location,
                    new Date(data.postedDate),
                    new Date(data.applicationDeadline),
                    data.description,
                    data.responsibilities || null,
                    data.qualification_requirement || null,
                    data.application_instructions || null,
                    data.contact_email || null
                );
            });
            
            // Publish success event
            this.eventHub.publish(Events.LoadPostsSuccess, this.cachedPosts);
            
            return this.cachedPosts;
        } catch (error) {
            console.error('Error loading posts:', error);
            this.eventHub.publish(Events.LoadPostsFailure, error);
            return [];
        }
    }

    // Load a specific post by ID
    async loadPostById(postId) {
        try {
            // First check if we have it cached
            const cachedPost = this.cachedPosts.find(post => post.id === postId);
            if (cachedPost) {
                this.eventHub.publish(Events.LoadPostSuccess, cachedPost);
                return cachedPost;
            }
            
            // Otherwise, fetch from API
            const response = await fetch(`${this.API_BASE_URL}/${postId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch post: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            const post = new Post(
                data.id,
                data.title,
                data.professor,
                data.salary,
                data.period,
                data.major,
                data.location,
                new Date(data.postedDate),
                new Date(data.applicationDeadline),
                data.description,
                data.responsibilities || null,
                data.qualification_requirement || null,
                data.application_instructions || null,
                data.contact_email || null
            );
            
            // Add to cache if not already there
            if (!this.cachedPosts.some(p => p.id === post.id)) {
                this.cachedPosts.push(post);
            }
            
            // Publish success event
            this.eventHub.publish(Events.LoadPostSuccess, post);
            
            return post;
        } catch (error) {
            console.error(`Error loading post with ID ${postId}:`, error);
            this.eventHub.publish(Events.LoadPostFailure, error);
            return null;
        }
    }

    // Store post in localStorage for saved posts feature
    storePost(post) {
        try {
            // Get existing saved posts
            const savedPostsJSON = localStorage.getItem('savedPosts') || '[]';
            const savedPosts = JSON.parse(savedPostsJSON);
            
            // Check if post is already saved
            if (!savedPosts.some(p => p.id === post.id)) {
                savedPosts.push(post);
                localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
            }
            
            this.eventHub.publish(Events.StorePostSuccess, post);
        } catch (error) {
            console.error('Error storing post:', error);
            this.eventHub.publish(Events.StorePostFailure, error);
        }
    }

    // Remove post from localStorage
    unStorePost(postId) {
        try {
            // Get existing saved posts
            const savedPostsJSON = localStorage.getItem('savedPosts') || '[]';
            const savedPosts = JSON.parse(savedPostsJSON);
            
            // Filter out the post to remove
            const updatedPosts = savedPosts.filter(p => p.id !== postId);
            localStorage.setItem('savedPosts', JSON.stringify(updatedPosts));
            
            this.eventHub.publish(Events.UnStorePostsSuccess, postId);
        } catch (error) {
            console.error('Error removing saved post:', error);
            this.eventHub.publish(Events.UnStorePostsFailure, error);
        }
    }

    // Get all saved posts
    getSavedPosts() {
        try {
            const savedPostsJSON = localStorage.getItem('savedPosts') || '[]';
            const savedPostsData = JSON.parse(savedPostsJSON);
            
            // Convert to Post objects
            return savedPostsData.map(data => {
                return new Post(
                    data.id,
                    data.title,
                    data.professor,
                    data.salary,
                    data.period,
                    data.major,
                    data.location,
                    new Date(data.postedDate),
                    new Date(data.applicationDeadline),
                    data.description,
                    data.responsibilities || null,
                    data.qualification_requirement || null,
                    data.application_instructions || null,
                    data.contact_email || null
                );
            });
        } catch (error) {
            console.error('Error getting saved posts:', error);
            return [];
        }
    }
}

// Create a singleton instance
export const postService = new PostService();