// wrapper class for IndexedDB
export class LocalDB {
    static db = null;
  
    // prevent instantiation
    constructor() {
      throw new Error("LocalDB is a static class and cannot be instantiated.");
    }
  
    /**
     * Opens or upgrades the IndexedDB database.
     * @returns {Promise<IDBDatabase>}
     */
    static open() {
        const dbName = "LocalDB";
        const version = 1;
        const upgradeCallback = (db) => { // https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/createObjectStore
            if (!db.objectStoreNames.contains("storage")) {
                db.createObjectStore("storage"); // not using keyPath https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/createObjectStore
                // using keyPath means we have in-line keys, i.e. the keys are part of the objects we're storing e.g. { { id: 1, name: "John", email: "john@umass.edu"}, { id: 2, name: "Sam", email: "sam@umass.edu"} }
                // not using it means the keys are separate e.g. { 1: { name: "John", email: "john@umass.edu" }, 2: { name: "Sam", email: "sam@umass.edu" } }
            }
        };

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, version);
  
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                upgradeCallback(db);
            };
  
            request.onsuccess = (event) => {
                LocalDB.db = event.target.result;
                resolve(LocalDB.db);
            };
    
            request.onerror = (event) => {
                reject(`Database error: ${event.target.errorCode}`);
            };
        });
    }
  
    static _getStore(mode = "readonly") {
        if (!LocalDB.db) {
            throw new Error("Database is not open.");
        }
        return LocalDB.db.transaction(["storage"], mode).objectStore("storage");
    }
  
    /**
     * Add an object to the database with the given key.
     * @param {string} key
     * @param {object} value
     * @returns {Promise<string>}
     */
    static add(key, value) {
        return this._promisify(this._getStore("readwrite").add(value, key));
    }
  
    /**
     * Overwrites the object in the database associated with the given key.
     * @param {string} key
     * @param {object} value
     * @returns {Promise<string>}
     */
    static put(key, value) {
        return this._promisify(this._getStore("readwrite").put(value, key)); // https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/put
    }
  
    /**
     * Retrieves an object from the database associated with the given key.
     * @param {string} key
     * @returns {Promise<any>}
     */
    static get(key) {
        return this._promisify(this._getStore().get(key)); // https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/get
    }
  
    /**
     * Deletes the object from the database associated with the given key.
     * @param {string} key
     * @returns {Promise<undefined>}
     */
    static delete(key) {
        return this._promisify(this._getStore("readwrite").delete(key));
    }
  
    static getAll() {
        return this._promisify(this._getStore().getAll());
    }
  
    static clear() {
        return this._promisify(this._getStore("readwrite").clear());
    }
  
    static _promisify(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Toggle bookmark status for a post
     * @param {string} postId - The ID of the post to toggle bookmark status
     * @returns {Promise<boolean>} - Success state of toggle operation
     */
    static async toggleBookmark(postId) {
        try {
            // Ensure postId is a string
            const postIdStr = String(postId);
            console.log(`Toggling bookmark for post ID: ${postIdStr}`);
            
            // Get the current user's email
            const sessionEmail = await this.get("sessionEmail");
            if (!sessionEmail) {
                console.error("No user session found. Cannot bookmark post.");
                return false;
            }
            
            // Get or create bookmarks list for this user
            const bookmarkKey = `bookmarks_${sessionEmail}`;
            let bookmarks = await this.get(bookmarkKey) || [];
            
            // Ensure bookmarks is an array (defensive programming)
            if (!Array.isArray(bookmarks)) {
                bookmarks = [];
            }
            
            // Log existing bookmarks
            console.log(`Current bookmarks: ${JSON.stringify(bookmarks)}`);
            
            // Check if postId is already in bookmarks
            const index = bookmarks.findIndex(id => String(id) === postIdStr);
            
            // Toggle bookmark status
            if (index !== -1) {
                // Remove bookmark
                bookmarks.splice(index, 1);
                console.log(`Removed bookmark for post ${postIdStr}`);
            } else {
                // Add bookmark (only if it doesn't already exist)
                bookmarks.push(postIdStr);
                console.log(`Added bookmark for post ${postIdStr}`);
            }
            
            // Log updated bookmarks
            console.log(`Updated bookmarks: ${JSON.stringify(bookmarks)}`);
            
            // Save updated bookmarks
            await this.put(bookmarkKey, bookmarks);
            return true;
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            return false;
        }
    }

    /**
     * Get all bookmarked posts for current user
     * @returns {Promise<Array<string>>} - Array of bookmarked post IDs
     */
    static async getBookmarks() {
        try {
            const sessionEmail = await this.get("sessionEmail");
            if (!sessionEmail) return [];
            
            const bookmarkKey = `bookmarks_${sessionEmail}`;
            const bookmarks = await this.get(bookmarkKey);
            
            // Ensure we always return an array
            if (!bookmarks || !Array.isArray(bookmarks)) {
                console.log("No bookmarks found or invalid bookmarks format, returning empty array");
                return [];
            }
            
            // Convert all bookmark IDs to strings for consistent comparison
            const stringBookmarks = bookmarks.map(id => String(id));
            
            // Return unique bookmark IDs to avoid duplicates
            const uniqueBookmarks = [...new Set(stringBookmarks)];
            console.log(`Retrieved bookmarks: ${JSON.stringify(uniqueBookmarks)}`);
            return uniqueBookmarks;
        } catch (error) {
            console.error("Error getting bookmarks:", error);
            return [];
        }
    }

    /**
     * Check if a post is bookmarked by the current user
     * @param {string} postId - The ID of the post to check
     * @returns {Promise<boolean>} - Whether the post is bookmarked
     */
    static async isBookmarked(postId) {
        try {
            // Ensure postId is a string
            const postIdStr = String(postId);
            
            const bookmarks = await this.getBookmarks();
            const isBookmarked = bookmarks.includes(postIdStr);
            
            // Debug log
            console.log(`Checking bookmark status for post ${postIdStr}: ${isBookmarked}`);
            
            return isBookmarked;
        } catch (error) {
            console.error("Error checking bookmark status:", error);
            return false;
        }
    }
}