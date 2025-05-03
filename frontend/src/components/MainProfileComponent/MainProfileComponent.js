import { BaseComponent } from "../BaseComponent/BaseComponent";

export class MainProfileComponent extends BaseComponent {
    constructor() {
        super();
    }

    render(canEdit) {
        const container = document.createElement("div");
        container.classList.add("main-grid");
        container.innerHTML = canEdit ?
                                `<div id="navbar" class="top-row">
                                    <div class="nav-container">
                                        <input type="button" id="home" value="Home" class="nav-button">
                                    </div>
                                    <div class="search-container">
                                        <input type="text" id="search" placeholder="Search...">
                                        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path fill="gray" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 119.5 5a4.5 4.5 0 010 9z"/>
                                        </svg>
                                    </div>
                                    <div class="nav-container">
                                        <input type="button" id="edit" value="Edit" class="nav-button">
                                    </div>
                                </div>
                                <div id="sideColumn" class="left-column">
                                    <div id="pfp">
                                        <span class="dot"></span>
                                    </div>
                                    <div id="info" class="side-column-text">
                                        <b id="fullName"></b>
                                        <p id="departmentDisplay"></p>
                                        <p id="emailDisplay"></p>
                                    </div>
                                    <div id="bio" class="side-column-text">
                                        <p id="bioDisplay"></p>
                                    </div>
                                </div>
                                <div id="mainBody" class="right-column">
                                </div>
                            `
                            :
                            `<div id="navbar" class="top-row">
                                    <div class="nav-container">
                                        <input type="button" id="home" value="Home" class="nav-button">
                                    </div>
                                    <div class="search-container">
                                        <input type="text" id="search" placeholder="Search...">
                                        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path fill="gray" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 119.5 5a4.5 4.5 0 010 9z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div id="sideColumn" class="left-column">
                                    <div id="pfp">
                                        <span class="dot"></span>
                                    </div>
                                    <div id="info" class="side-column-text">
                                        <b id="fullName"></b>
                                        <p id="departmentDisplay"></p>
                                        <p id="emailDisplay"></p>
                                    </div>
                                    <div id="bio" class="side-column-text">
                                        <p id="bioDisplay"></p>
                                    </div>
                                </div>
                                <div id="mainBody" class="right-column">
                                </div>
                            `;
        return container;
    }
}