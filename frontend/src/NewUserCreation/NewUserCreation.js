document.addEventListener("DOMContentLoaded", () => {
    const imgDrop = document.getElementById("uploadProfileImage");
    imgDrop.addEventListener("dragover", (e) => {
        e.preventDefault(); // ask what exactly this does
        imgDrop.style.backgroundColor = "gray";
    });

    imgDrop.addEventListener("dragleave", () => {
        imgDrop.style.backgroundColor = "#aaa";
    });

    imgDrop.addEventListener("drop", (e) => {
        e.preventDefault();
        imgDrop.style.borderColor = "#aaa";
        const files = e.dataTransfer.files; // find out exactly what this does
        for (let i = 0; i < files.length; ++i) {
            console.log("Dropped file:", files[i].name, files[i].type, files[i].size);
            if(files[i]){
                const reader = new FileReader();
                reader.onload = function(e) {
                    let img = document.getElementById('dummyProfileImage');
                    img.src = e.target.result;

                }
                reader.readAsDataURL(files[i]);
            }
            // eventually will upload the files and send it to the backend server
        }
    });
    
    // for when the user uploads the file when they click the input field
    imgDrop.addEventListener('change', (e) => {
        console.log(imgDrop)
        console.log('running')
        const file = e.target.files[0];
        console.log("Dropped file: ", file.name, file.type, file.size);
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('dummyProfileImage').src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });
});