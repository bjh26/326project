import { BaseComponent } from '../../components/BaseComponent/BaseComponent.js';
import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';
import { SearchBarComponent } from '../../components/SearchBar/index.js';
import { JobListingsComponent } from '../../components/JobListings/index.js';
import { JobDetailsComponent } from '../../components/JobDetails/index.js';
import { SavedPostsComponent } from '../../components/SavedPosts/index.js';
import { LocalDB } from '../../services/LocalDB.js';
import { NavBarComponent } from '../../components/NavBar/index.js';

export class HomePage extends BaseComponent {
    constructor() {
        super();
        this.container = document.createElement('div');
        this.container.id = 'home-page';
        this.jobPostingsContainer = null;
        this.hub = EventHub.getInstance();
        this.isHomePage = true;
        
        // Initialize components
        this.navBar = new NavBarComponent();
        this.searchBar = new SearchBarComponent();
        this.jobListings = new JobListingsComponent();
        this.jobDetails = new JobDetailsComponent();
        this.savedPosts = new SavedPostsComponent();
    }

    async render() {
        this.loadCSS('pages/HomePage', 'HomePage');
        
        // Clear the container
        this.container.innerHTML = '';
        
        // Render navbar component (always visible)
        this.container.appendChild(this.navBar.render());
        
        // Render search bar component (always visible)
        this.container.appendChild(await this.searchBar.render());
        
        // Create job postings container
        this.jobPostingsContainer = document.createElement('div');
        this.jobPostingsContainer.className = 'job-postings-container';
        this.container.appendChild(this.jobPostingsContainer);
        
        // Initialize home page state
        this.isHomePage = await LocalDB.get('isHomePage');
        if (this.isHomePage === undefined) {
            await LocalDB.put('isHomePage', true);
            this.isHomePage = true;
        }
        
        // Render appropriate content
        await this.renderContent();
        
        // Listen for NavigateTo events
        this.hub.subscribe(Events.NavigateTo, async (data) => {
            if (data.page === "home") {
                this.isHomePage = true;
                await this.renderContent();
            } else if (data.page === "savedPosts") {
                this.isHomePage = false;
                await this.renderContent();
            }
        });
        
        return this.container;
    }

    async renderContent() {
        // Clear container first
        this.jobPostingsContainer.innerHTML = '';
        
        if (!this.isHomePage) {
            // Render saved posts component
            this.jobPostingsContainer.appendChild(await this.savedPosts.render());
            
            // Initialize saved posts data immediately
            await this.savedPosts.loadSavedPosts();
        } else {
            // Append job listings and job details components
            this.jobPostingsContainer.appendChild(await this.jobListings.render());
            this.jobPostingsContainer.appendChild(await this.jobDetails.render());
            
            // Initialize job listings immediately
            this.hub.publish(Events.LoadPosts);
        }
    }
}