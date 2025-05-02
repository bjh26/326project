// wrapper class for IndexedDB
export class LocalDB {
    static db = null;
  
    // prevent instantiation
    constructor() {
      throw new Error("LocalDB is a static class and cannot be instantiated.");
    }
  
    /**
     * Open or upgrade the IndexedDB database
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
  
    static add(key, value) {
        return this._promisify(this._getStore("readwrite").add(value, key));
    }
  
    static put(key, value) {
        return this._promisify(this._getStore("readwrite").put(value, key)); // https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/put
    }
  
    static get(key) {
        return this._promisify(this._getStore().get(key)); // https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/get
    }
  
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
}