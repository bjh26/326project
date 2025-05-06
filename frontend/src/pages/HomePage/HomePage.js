import { BaseComponent } from '../../components/BaseComponent/BaseComponent.js';
import { EventHub } from '../../eventhub/EventHub.js';
import { Events } from '../../eventhub/Events.js';
import { SearchBarComponent } from '../../components/SearchBar/index.js';
import { JobListingsComponent } from '../../components/JobListings/index.js';
import { JobDetailsComponent } from '../../components/JobDetails/index.js';
import { SavedPostsComponent } from '../../components/SavedPosts/index.js';
import { LocalDB } from '../../services/LocalDB.js';

export class HomePage extends BaseComponent {
    #container = null;
    #jobPostingsContainer = null;
    #hub = null;
    #searchBar = null;
    #jobListings = null;
    #jobDetails = null;
    #savedPosts = null;
    #isHomePage;

    constructor() {
        super();
        this.#hub = EventHub.getInstance();
        
        // Initialize components
        this.#searchBar = new SearchBarComponent();
        this.#jobListings = new JobListingsComponent();
        this.#jobDetails = new JobDetailsComponent();
        this.#savedPosts = new SavedPostsComponent();
    }

    async render() {
        this.loadCSS('src/pages/HomePage', 'style');
        this.#container = document.createElement('div');
        this.#container.id = 'home-page';
        
        // Render search bar component (always visible)
        this.#container.appendChild(this.#searchBar.render());
        
        // Create job postings container
        this.#jobPostingsContainer = document.createElement('div');
        this.#jobPostingsContainer.className = 'job-postings-container';
        this.#container.appendChild(this.#jobPostingsContainer);
        
        // Render appropriate content based on mode
        await this.#renderContent();
        
        return this.#container;
    }

    async #renderContent() {
        // Clear container first
        this.#jobPostingsContainer.innerHTML = '';
        this.#isHomePage = await LocalDB.get('isHomePage');
        if (this.#isHomePage == undefined) {
            await LocalDB.put('isHomePage', true);
            this.#isHomePage = true;
        }
        else if (!this.#isHomePage) {
            // Render saved posts component
            this.#jobPostingsContainer.appendChild(this.#savedPosts.render());
            
            // Initialize saved posts data
            setTimeout(() => {
                this.#savedPosts.loadSavedPosts();
            }, 100);
        } else {
            // Append job listings (left) and job details (right) components
            this.#jobPostingsContainer.appendChild(this.#jobListings.render());
            this.#jobPostingsContainer.appendChild(this.#jobDetails.render());
            
            // Initialize job listings
            setTimeout(() => {
                this.#hub.publish(Events.LoadPosts);
            }, 100);
        }
    }

    
}