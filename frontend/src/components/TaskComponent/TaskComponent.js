import { BaseComponent } from '../BaseComponent/BaseComponent.js';

export class TaskComponent extends BaseComponent {
  #container = null;

  constructor(taskData = {}) {
    super();
    this.taskData = taskData;
    this.loadCSS('TaskComponent');
  }

  render() {
    // Create the main container
    this.#container = document.createElement('div');
    this.#container.classList.add('task-item');

    // Render the task text
    const taskText = this.#createTaskText();
    this.#container.appendChild(taskText);

    // Render the file link if a file is present
    if (this.taskData.file) {
      const fileLink = this.#createFileLink(this.taskData.file);
      this.#container.appendChild(fileLink);
    }

    return this.#container;
  }

  // Private method to create task text element
  #createTaskText() {
    const taskText = document.createElement('span');
    taskText.textContent = this.taskData.task || 'No task description';
    return taskText;
  }

  // Private method to create file link element
  #createFileLink(file) {
    const fileLink = document.createElement('a');
    fileLink.href = URL.createObjectURL(file);

    fileLink.textContent = file.name;
    fileLink.target = '_blank';
    return fileLink;
  }
}
