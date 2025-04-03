# Fonts
inside button: `font-family: "Google Sans",Roboto,Arial,sans-serif;`
text: `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;`


# Colors
UMass red: #881111
background-color: #F9F9F9
feature backgrounds: #FFFFFF
button text inactive: #3c4043

# Forms
box-shadow: 0 4px 8px rgba(0,0,0,0.1)
before completion: #A24857
after completion: #881111
on hover/on click: darker shade of #881111

# Button
```
.button {
  background-color: #fff;
  border-radius: 24px;
  border-style: none;
  box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0;
  box-sizing: border-box;
  color: #3c4043;
  cursor: pointer;
  font-family: "Google Sans",Roboto,Arial,sans-serif;
  font-size: 14px;
  height: 48px;
  letter-spacing: .25px;
  line-height: normal;
  max-width: 100%;
  padding: 2px 24px;
}

.button:hover {
  background: #F6F9FE;
  color: #881111;
}

.button:active {
  box-shadow: 0 4px 4px 0 rgb(60 64 67 / 30%), 0 8px 12px 6px rgb(60 64 67 / 15%);
  outline: none;
}

.button:focus {
  outline: none;
  border: 2px solid #881111;
}
```

# Search Bar
```
<div class="search-container">
    <input type="text" id="search" placeholder="Search...">
    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fill="gray" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 119.5 5a4.5 4.5 0 010 9z"/>
    </svg>
</div>
```
```
.search-container {
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative;
  max-width: 500px;
  width: 100%;
}

#search {
  width: 100%; /* Ensures it fills the container but doesn't exceed max-width */
  max-width: 500px; /* Hard limit */
  padding: 10px 40px 10px 20px; /* Keeps space for the search icon */
  border: 2px solid maroon;
  border-radius: 24px;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  right: 10px; /* Keeps icon inside input field */
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none; /* Prevents interaction issues */
}

.nav-button, #search {
  background-color: #fff;
  border-radius: 24px;
  border-style: none;
  box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0;
  box-sizing: border-box;
  color: #3c4043;
  cursor: pointer;
  font-family: "Google Sans",Roboto,Arial,sans-serif;
  font-size: 14px;
  height: 48px;
  letter-spacing: .25px;
  line-height: normal;
  max-width: 100%;
  padding: 2px 24px;
}

.nav-button:active, #search:active {
  box-shadow: 0 4px 4px 0 rgb(60 64 67 / 30%), 0 8px 12px 6px rgb(60 64 67 / 15%);
  outline: none;
}

.nav-button:focus, #search:focus {
  outline: none;
  border: 2px solid maroon;
}
```