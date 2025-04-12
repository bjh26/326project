document.addEventListener("DOMContentLoaded", () => {
    uploadImage();
    uploadResume();
    const savedResume = (localStorage.getItem('resume'));
    const savedProfile = localStorage.getItem('profileImage');
    if(savedResume){
        document.getElementById('uploadResume').textContent = `${savedResume} uploaded`;
        document.getElementById('uploadResume').style.backgroundColor = '#881111';
        document.getElementById('uploadResume').style.color = 'white';
    }
    if (savedProfile) {
        document.getElementById('dummyProfileImage').src = savedProfile;
    }
    localStorage.clear();
});

// can make the upload feature more general, TODO for next milestone
function uploadImage(){
    const imgDrop = document.getElementById("uploadProfileImage");
    imgDrop.addEventListener("dragover", (e) => {
        e.preventDefault(); 
        imgDrop.style.backgroundColor = "gray";
    });

    imgDrop.addEventListener("dragleave", () => {
        imgDrop.style.backgroundColor = "#aaa";
    });

    imgDrop.addEventListener("drop", (e) => {
        e.preventDefault();
        imgDrop.style.borderColor = "#aaa";
        const files = e.dataTransfer.files; 
        console.log('saved to local storage')
        for (let i = 0; i < files.length; ++i) {
            console.log("Dropped file:", files[i].name, files[i].type, files[i].size);
            if(files[i]){
                const reader = new FileReader();
                reader.onload = function(e) {
                    let img = document.getElementById('dummyProfileImage');
                    img.src = e.target.result;
                    localStorage.setItem('profileImage', e.target.result);
                }
                reader.readAsDataURL(files[i]);
            }
            // eventually will upload the files and send it to the backend server
        }
    });
    
    // for when the user uploads the file when they click the input field
    imgDrop.addEventListener('change', (e) => {
        const file = e.target.files[0];
        console.log("Dropped file: ", file.name, file.type, file.size);
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('dummyProfileImage').src = e.target.result;
                localStorage.setItem('profileImage', e.target.result);
                console.log('saved to local storage')
            }
            reader.readAsDataURL(file);
        }
    });
}

function uploadResume(){
    const resumeDrop = document.getElementById("uploadResume");

    resumeDrop.addEventListener("dragover", (e) => {
        e.preventDefault(); 
        resumeDrop.style.color = "white";
        resumeDrop.style.backgroundColor = "#881111";
    });

    resumeDrop.addEventListener("dragleave", () => {
        resumeDrop.style.color = "white";
        resumeDrop.style.backgroundColor = "#881111";
    });

    resumeDrop.addEventListener("drop", (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files; 
        resumeDrop.style.color = "white";
        resumeDrop.style.backgroundColor = "#881111";
        resumeDrop.textContent = `${files[0].name} uploaded`;
        localStorage.setItem('resume', files[0].name);
        console.log('saved to local storage')
        console.log("Dropped file:", files[0].name, files[0].type, files[0].size);
        // eventually will upload the files and send it to the backend server
    });
    
    // for when the user uploads the file when they click the input field
    // this implementation only allows for one upload using direct clicking, 
    // however once the live viewer is loaded, it will allow for multiple uploads like the image upload
    document.getElementById('resume').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file){
            resumeDrop.textContent = `${file.name} uploaded`;
            resumeDrop.style.color = "white";
            resumeDrop.style.backgroundColor = "#881111"; 
            localStorage.setItem('resume', file.name);
            console.log('saved to local storage');
            console.log("Dropped file: ", file.name, file.type, file.size);
        }
    });
}