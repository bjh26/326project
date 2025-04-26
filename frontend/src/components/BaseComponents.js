export class BaseComponents {
    loadCss;
    parent;
    constructor() {
        this.loadCss = false;
        this.parent = document.createElement("div");
    }

    render() {
        throw new Error("Method 'render()' must be implemented.");
    }

    loadCSS(path, filename) {
        if (this.loadCss) {
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `${path}/${filename}.css`;
        link.type = "text/css";
        document.head.appendChild(link);
        this.loadCss = true;
    }

    dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.parent.dispatchEvent(event);
    }

    // callback: EventListenerOrEventListenerObject
    listenCustomEvent(eventName, callback) {
        this.parent.addEventListener(eventName, callback);
    }
}