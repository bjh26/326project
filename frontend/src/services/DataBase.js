export class DataBase {
    static db = null;
  
    // Prevent instantiation
    constructor() {
      throw new Error("DataBase is a static class and cannot be instantiated.");
    }
  
    /**
     * Open or upgrade the IndexedDB database
     * @param {string} dbName
     * @param {number} version
     * @param {(db: IDBDatabase) => void} upgradeCallback - called with db in onupgradeneeded
     * @returns {Promise<IDBDatabase>}
     */
    static open(dbName, version, upgradeCallback) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, version);
  
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (typeof upgradeCallback === 'function') {
                    upgradeCallback(db);
                }
            };
  
            request.onsuccess = (event) => {
                DataBase.db = event.target.result;
                resolve(DataBase.db);
            };
    
            request.onerror = (event) => {
                reject(`Database error: ${event.target.errorCode}`);
            };
        });
    }
  
    static _getStore(storeName, mode = "readonly") {
        if (!DataBase.db) {
            throw new Error("Database is not open.");
        }
        return DataBase.db.transaction(storeName, mode).objectStore(storeName);
    }
  
    static add(storeName, value, key) {
        return this._promisify(this._getStore(storeName, "readwrite").add(value, key));
    }
  
    static put(storeName, value, key) {
        return this._promisify(this._getStore(storeName, "readwrite").put(value, key));
    }
  
    static get(storeName, key) {
        return this._promisify(this._getStore(storeName).get(key));
    }
  
    static delete(storeName, key) {
        return this._promisify(this._getStore(storeName, "readwrite").delete(key));
    }
  
    static getAll(storeName) {
        return this._promisify(this._getStore(storeName).getAll());
    }
  
    static clear(storeName) {
        return this._promisify(this._getStore(storeName, "readwrite").clear());
    }
  
    static _promisify(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}