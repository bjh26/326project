export class BaseComponent {
  constructor() {
    this.cssLoaded = false;
  }

  /**
   * This is an abstract method that must be implemented by child classes.
   * It must return an HTMLElement object.
   * @abstract
   * @returns {HTMLElement}
   */
  render() {
    throw new Error('render method not implemented');
  }

  loadCSS(path, filename) {
    if (this.cssLoaded) {
        return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${path}/${filename}.css`;
    link.type = "text/css";
    link.setAttribute('data-component-style', 'true');
    document.head.appendChild(link);
    this.cssLoaded = true;
}


  dispatchCustomEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    this.parent.dispatchEvent(event);
  }

  listenToEvent(eventName, callback) {
    this.parent.addEventListener(eventName, callback);
  }
}
