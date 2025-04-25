document.addEventListener("DOMContentLoaded", () => {
    restorePage();
    dragAndDrop("uploadProfileImage", "profileImage");
    dragAndDrop("uploadResume", "resume");
    change("uploadProfileImage", "profileImage");
    change("uploadResume", "resume");
    document.getElementById("createAccount").addEventListener('click', addUser);
    document.getElementById("deleteAccount").addEventListener('click', deleteUser);
});

function restorePage() {
    const inputFields = ["firstName", "lastName", "email", "username", "department", "bio"];
    
    inputFields.forEach(id => {
        const field = document.getElementById(id);
        const storedValue = localStorage.getItem(id);
        if (storedValue) {
            field.value = storedValue;
        } 
        field.addEventListener('input', () => {
            localStorage.setItem(id, field.value);
        });
    });

    try{
        const savedResume = (localStorage.getItem('uploadResume'));
        const savedProfile = localStorage.getItem('uploadProfileImage');
        if(savedResume){
            document.getElementById('uploadResume').style.backgroundColor = '#881111';
            document.getElementById('uploadResume').style.color = 'white';
        }
        if(savedProfile){
            document.getElementById('dummyProfileImage').src = savedProfile;
        }
    } catch (err) {
        console.error("Error restoring uploads from localStorage:", err, "or nothing saved yet");
    }
}

/**
 * @param {string} element - The div where your input element resides in.
 * @param {string} inputElementId - The id of the input field. 
 * Allows for drag and drop operations on input fields.
 * Call both change() and dragAndDrop() for seamless UX.
 */
function dragAndDrop(element, inputElementId) {
    const dropSpace = document.getElementById(element);
    const dropItem = document.getElementById(inputElementId);
   
    dropSpace.addEventListener("dragover", (e) => {
        e.preventDefault(); 
        dropSpace.style.backgroundColor = "#881111";
    });

    dropSpace.addEventListener("dragleave", () => {
        dropSpace.style.backgroundColor = "lightgray";
        dropSpace.style.color = "white";
    });

    dropSpace.addEventListener("drop", (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files; 
        console.log('saved to local storage'); 
        for (let i = 0; i < files.length; ++i) {
            console.log("Dropped file:", files[i].name, files[i].type, files[i].size);
            const file = files[i];
            if(files[i]){
                const reader = new FileReader();
                reader.onload = function(e) {
                    const fileType = file.type; 
                    console.log(fileType)
                    if (fileType.startsWith("image/")) {
                        document.getElementById('dummyProfileImage').src = e.target.result;
                        dropItem.textContent = ""; 
                    } else {
                        dropItem.src = "";
                    }
                    localStorage.setItem(element, e.target.result);
                }
                reader.readAsDataURL(file);
            }
            // eventually will upload the files and send it to the backend server
        }
    });
}

/**
 * @param {string} element - The div where your input element resides in.
 * @param {string} inputElementId - The id of the input field. 
 * Allows for users to interact with uploading files by clicking on the input field.
 * Call both change() and dragAndDrop() for seamless UX.
*/
function change(element, inputElementId) {
    const dropSpace = document.getElementById(element);
    const dropItem = document.getElementById(inputElementId);
    console.log(dropSpace, dropItem); 
    dropItem.addEventListener('change', (e) => {
        const file = e.target.files[0];
        console.log("Dropped file:", file.name, file.type, file.size);
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileType = file.type; 
            if (fileType.startsWith("image/")) {
                document.getElementById('dummyProfileImage').src = e.target.result;
                dropItem.textContent = ""; 
            } else {
                dropItem.src = "";
                dropSpace.style.backgroundColor = "#881111";
                dropSpace.style.color = "white";
            }
            localStorage.setItem(element, e.target.result);
            console.log('saved to local storage');
        }
        reader.readAsDataURL(file);
        e.target.value = '';
    });
}


/**
 * Adds a new user to backend server.
 */
async function addUser() {
    const profile = {
        firstName: document.getElementById("firstName").value, 
        lastName: document.getElementById("lastName").value, 
        email: document.getElementById("email").value, 
        displayEmail: false, 
        bio: document.getElementById("bio").value, 
        // will add when server is big enough
        // profileImage: localStorage.getItem('uploadProfileImage'),
        // resume: localStorage.getItem('uploadResume'),
        researchItems: []
    };

    if(document.getElementById('email').value === '' || document.getElementById('email').value === null){
        alert("Please enter in your email.")
    }

    try {
        const res = await fetch('/profile', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profile),
        });

        if(!res.ok) {
            const errorMessage = await res.json(); // or response.json() if backend sends JSON
            throw new Error(errorMessage.error);
        } 
    } catch(error) {
        alert(`${error.message}`);
    }
}

/**
 * Removes a user from the backend server.
 */
async function deleteUser() {
    const profile = {
        firstName: document.getElementById("firstName").value, 
        lastName: document.getElementById("lastName").value, 
        email: document.getElementById("email").value, 
        displayEmail: false, 
        bio: document.getElementById("bio").value, 
        // will add when server is big enough
        // profileImage: localStorage.getItem('uploadProfileImage'),
        // resume: localStorage.getItem('uploadResume'),
        researchItems: []
    };

    await fetch('/profile/:id', {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
    }); 
    
    console.log('User deleted');
}