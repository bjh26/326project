import express from "express";

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

const researchPostings = {}; 


function set(formInfo, uniqueID) {
    const unique = uniqueID ? uniqueID : Object.keys(researchPostings).length; 
    researchPostings[unique] = formInfo;
    console.log(researchPostings); 
}

function del(uniqueID) {
    console.log(uniqueID);
    if (uniqueID) {
        delete researchPostings[uniqueID] 
    }
}

app.post('/researchPost', (request, response) => {
    const newPost = request.body;
    set(newPost, null); 
    response.json(newPost);
})

app.put('/researchPost/:id', (request, response) => {
    const id = request.params.id;
    const editedPost = request.body; 
    set(editedPost, id);
    response.json(editedPost)
})

app.delete('/researchPost/:id', (request, response) => {
    const id = request.params.id;
    del(id);
    
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


