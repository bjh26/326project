document.addEventListener("DOMContentLoaded", () => {
    restorePage();
    dragAndDrop("uploadProfileImage", "profileImage");
    dragAndDrop("uploadResume", "resume");
    change("uploadProfileImage", "profileImage");
    change("uploadResume", "resume");
});

function restorePage() {
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