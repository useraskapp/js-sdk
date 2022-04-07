import "./tagger.scss";

export class Tagger {

    private origin: string = "http://localhost:3000";

    private captureClick = (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        window.parent.postMessage({
            request: "CURRENT_ELEMENT",
            payload: {
                id: e.target.id,
                className: e.target.className
            }
        }, this.origin);
        e.target.classList.add("div-select");
        setTimeout(() => {
            e.target.classList.remove("div-select");
        }, 100)
    }

    init() {
        window.addEventListener("message", (e: any) => {
            if (e.origin === this.origin && e.data && e.data.request) {
                if (e.data.request === "PAGE_URL") {
                    window.parent.postMessage({
                        request: "PAGE_URL",
                        payload: {
                            path: window.location.pathname,
                            url: window.location.href
                        }
                    }, this.origin);
                }
                if (e.data.request === "CAPTURE_MODE") {
                    let windowDoc = document.querySelector("*");
                    if (windowDoc) {
                        if (e.data.payload === true) {
                            windowDoc.classList.add("cursor-pointer");
                            windowDoc.addEventListener("click", this.captureClick, true);
                        } else {
                            windowDoc.classList.remove("cursor-pointer");
                            windowDoc.removeEventListener("click", this.captureClick, true);
                        }
                    }
                }
            }
        });
    }
}
