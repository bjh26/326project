document.addEventListener('DOMContentLoaded', function() {
    const steps = document.querySelectorAll('.step');
    const nextButtons = document.querySelectorAll('[id^="next"]');
    const backButtons = document.querySelectorAll('[id^="back"]');
    const form = document.getElementById('CreateAPostForm');
    const statusDiv = document.getElementById('status');
    const deleteButton = document.getElementById('delete'); 
    const modeInput = document.getElementById('mode');
    const modeSelect = document.getElementById('mode-toggle');
    const uniqueIdInput = document.getElementById('unique-id');

    let db;
    const DB_NAME = 'postFormDB';
    const STORE_NAME = 'formProgress';
    
    async function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            
            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                showStatus('Error accessing local storage', 'error');
                reject(event.target.error);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
            
            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('IndexedDB initialized successfully');
                resolve(db);
            };
        });
    }
    
    async function saveProgress() {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const formData = collectFormData();
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            formData.id = 'postForm'; 
            formData.lastUpdated = new Date().toISOString();
            
            const request = store.put(formData);
            
            request.onerror = (event) => {
                console.error('Error saving progress:', event.target.error);
                showStatus('Failed to save progress', 'error');
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                console.log('Progress saved successfully');
                showStatus('Progress saved', 'success', 2000);
                resolve();
            };
        });
    }

    async function loadProgress() {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get('postForm');
            
            request.onerror = (event) => {
                console.error('Error loading progress:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                const data = event.target.result;
                if (data) {
                    console.log('Loaded saved progress:', data);
                    resolve(data);
                } else {
                    console.log('No saved progress found');
                    resolve(null);
                }
            };
        });
    }
    
    function collectFormData() {
        return {
            // uniqueID: !document.getElementById('unique-id').value.trim() ? None : document.getElementById.value,
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            responsibilities: document.getElementById('responsibilities').value,
            qualifications: document.getElementById('qualifications-and-requirements').value,
            compensation: document.getElementById('compensation').value,
            hiringPeriod: document.getElementById('hiring-period').value,
            applicationInstructions: document.getElementById('application-instructions').value,
            deadline: document.getElementById('deadline').value,
            contactName: document.getElementById('contact-name').value,
            contactEmail: document.getElementById('contact-email').value,
            currentStep: getCurrentStep()
        };
    }
    
    function getCurrentStep() {
        for (let i = 0; i < steps.length; i++) {
            if (steps[i].classList.contains('active')) {
                return i + 1;
            }
        }
        return 1;
    }
    
    function populateForm(data) {
        if (!data) return;
        
        document.getElementById('title').value = data.title || '';
        document.getElementById('description').value = data.description || '';
        document.getElementById('responsibilities').value = data.responsibilities || '';
        
        document.getElementById('qualifications-and-requirements').value = data.qualifications || '';
        document.getElementById('compensation').value = data.compensation || '';
        document.getElementById('hiring-period').value = data.hiringPeriod || '';
        document.getElementById('application-instructions').value = data.applicationInstructions || '';
        document.getElementById('deadline').value = data.deadline || '';
        
        document.getElementById('contact-name').value = data.contactName || '';
        document.getElementById('contact-email').value = data.contactEmail || '';
        

        if (data.currentStep) {
            navigate('step' + data.currentStep);
        }
        
        if (data.lastUpdated) {
            const date = new Date(data.lastUpdated);
            showStatus(`Loaded saved progress from ${date.toLocaleString()}`, 'info', 5000);
        }
    }
    
    // Fake server
    async function submitToFakeServer(formData) {
        return new Promise((resolve, reject) => {
            showStatus('Submitting form...', 'info');
            
            // Delay
            setTimeout(() => {
                // 90% chance of success
                if (Math.random() < 0.9) {
                    resolve({ success: true, message: 'Form submitted successfully!' });
                } else {
                    reject(new Error('Server error: Could not process your submission'));
                }
            }, 1500);
        });
    }
    
    // Navigation function - shows the target view and hides others
    function navigate(viewId) {
        steps.forEach(step => step.classList.remove('active'));
        const targetStep = document.getElementById(viewId);
        if (targetStep) {
            targetStep.classList.add('active');
            console.log(`Navigated to ${viewId}`);
            
            saveProgress().catch(error => {
                console.error('Error saving during navigation:', error);
            });
        } else {
            console.error(`View with ID ${viewId} not found`);
        }
    }
    

    function validateStep(stepId) {
        const inputs = document.querySelectorAll(`#${stepId} input:not([type="date"]), #${stepId} textarea`);
        let isValid = true;
        inputs.forEach(input => {
            if (input.value.trim() === '') {
                isValid = false;
                input.classList.add('error');
                input.addEventListener('input', function() {
                    if (this.value.trim() !== '') {
                        this.classList.remove('error');
                    }
                }, { once: true });
            } else {
                input.classList.remove('error');
            }
        });
        const dateInputs = document.querySelectorAll(`#${stepId} input[type="date"]`);
        dateInputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.classList.add('error');
                input.addEventListener('input', function() {
                    if (this.value) {
                        this.classList.remove('error');
                    }
                }, { once: true });
            } else {
                input.classList.remove('error');
            }
        }); 
        if (!isValid) {
            showStatus('Please fill in all fields', 'error');
        }
        return isValid;
    }
    
    function showStatus(message, type, duration = 3000) {
        statusDiv.textContent = message;
        statusDiv.className = type;
        
        if (type === 'error') {
            statusDiv.style.color = 'red';
        } else if (type === 'success') {
            statusDiv.style.color = 'green';
        } else if (type === 'info') {
            statusDiv.style.color = 'blue';
        }
        
        if (duration > 0) {
            setTimeout(() => {
                statusDiv.textContent = '';
                statusDiv.className = '';
                statusDiv.style.color = '';
            }, duration);
        }
    }

    function updateUniqueIdState(mode) {
        if (mode === 'create') {
            uniqueIdInput.value = '';
            uniqueIdInput.disabled = true;
            fetch('/researchPost', {
                method: `POST`,
                body: JSON.stringify(collectFormData())
            });
        } else {
            uniqueIdInput.disabled = false;
            fetch(`/researchPost/${uniqueIdInput.value}`, {
                method: `PUT`,
                body: JSON.stringify(collectFormData())
            });
        }
    }
    
    modeSelect.addEventListener('change', () => {
        const selectedMode = modeSelect.value;
        modeInput.value = selectedMode;
        updateUniqueIdState(selectedMode);
        showStatus(`Mode: ${selectedMode.toUpperCase()}`, 'info');
    });
    
    // Initial state on page load
    updateUniqueIdState(modeSelect.value);

    deleteButton.addEventListener('click', function () {
        fetch(`/researchPost/${uniqueIdInput.value}`), {
            method: `DELETE`
        }
    })
    
    // event listeners for buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = button.closest('.step').id;
            const nextStepNum = parseInt(currentStep.replace('step', '')) + 1;
            const nextStepId = 'step' + nextStepNum;
            
            if (validateStep(currentStep)) {
                navigate(nextStepId);
            }
        });
    });
    
    
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = button.closest('.step').id;
            const prevStepNum = parseInt(currentStep.replace('step', '')) - 1;
            const prevStepId = 'step' + prevStepNum;
            
            navigate(prevStepId);
        });
    });
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateStep('step3')) {
            const formData = collectFormData();
    
            try {
            
                await saveProgress();
                
                const result = await submitToFakeServer(formData);
                
                showStatus(result.message, 'success');
                
                setTimeout(async () => {
                    const transaction = db.transaction([STORE_NAME], 'readwrite');
                    const store = transaction.objectStore(STORE_NAME);
                    await store.delete('postForm');
                    
                    form.reset();
                    navigate('step1');
                }, 2000);
                
            } catch (error) {
                console.error('Submission error:', error);
                showStatus(`Failed to submit: ${error.message}. Your progress is saved.`, 'error');
            }
        }
    });
    
    // Auto-save on form input changes
    let saveTimeout;
    form.addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveProgress().catch(error => {
                console.error('Auto-save error:', error);
            });
        }, 1000); // Save after 1 second of inactivity
    });
    
    // initializing 
    async function init() {
        try {
            await initDB();
            
            const savedData = await loadProgress();
            if (savedData) {
                populateForm(savedData);
            } else {
                navigate('step1');
            }
            
        } catch (error) {
            console.error('Initialization error:', error);
            showStatus('Could not load saved progress', 'error');
            // back
            navigate('step1');
        }
    }
    
    // start
    init();
});