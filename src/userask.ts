import axios from "axios";
import "./userask.scss";

export default class UserAsk {

    private projectId: string;
    private requestId: string;
    private readonly apiURL: string = "http://localhost:8080/public/api/v1/execution";

    constructor(projectId: string) {
        this.projectId = projectId;
        this.requestId = "";
        this.createFormBox();
    }

    // creates a form box initally
    createFormBox() {
        if (!document.getElementById("userask-form")) {
            let formBox = document.createElement("div");
            formBox.id = "userask-form";
            formBox.className = "userask-form-box";
            formBox.style.display = "none";
            document.body.append(formBox);
        }
    }

    // calls to log an event
    async logEvent(event_indentifier: string, fingerprint: string | null, value: any) {
        if (event_indentifier === null) {
            throw new Error("no event identifier is present");
        }

        let log_data = {
            event_identifier: event_indentifier,
            project_id: this.projectId,
            data: {
                fingerprint: fingerprint,
                value: value
            }
        }
        let root = document.documentElement;
        let response = await axios.post(`${this.apiURL}/log-event`, log_data);
        if (response.data !== null) {
            root.style.setProperty("--userask-theme", response.data.theme);
            this.requestId = response.data.request_id;
            this.renderForm(response.data.form_data);
        } else {
            return { status: "event logged" };
        }
    }

    // submits the form
    async submitForm(responseData: any) {
        try {

            let data = {
                request_id: this.requestId,
                data: responseData
            }

            let response = await axios.post(`${this.apiURL}/save-response`, data);
            if (response.data !== null) {
                this.renderForm(response.data);
            } else {
                // Close the form
                let formBox = document.getElementById("userask-form");
                if (formBox) {
                    this.successPage();
                    setTimeout(()=>{
                        if(formBox) {
                            formBox.style.display = "none";
                        }
                    }, 2000)
                }
            }
        } catch (err) {
            // Close the form
            let formBox = document.getElementById("userask-form");
            if (formBox) {
                formBox.style.display = "none";
            }
        }
    }

    closeForm() {
        let formBox = document.getElementById("userask-form");
        if (formBox) {
            formBox.innerHTML = "";
            formBox.style.display = "none";
        }
    }

    successPage() {
        let formBox = document.getElementById("userask-form");

        if (formBox) {
            formBox.innerHTML = "";

            formBox.style.display = "inherit";

            let title = document.createElement("h1");
            title.className = "form__title"
            title.innerHTML = "Thank you 🤗";
            formBox.append(title);

            let description = document.createElement("p");
            description.className = "form__description"
            description.innerHTML = "✅ Saved your response";
            formBox.append(description);

            let closeButton = document.createElement("button");
            closeButton.onclick = () => this.closeForm();
            closeButton.innerText = "x";
            closeButton.className = "form__close-button";
            formBox.append(closeButton);

        }
    }

    renderForm(formSchema: any) {
        let formBox = document.getElementById("userask-form");

        if (formBox) {

            formBox.innerHTML = "";

            formBox.style.display = "inherit";

            let title = document.createElement("h1");
            title.className = "form__title"
            title.innerHTML = formSchema.title;
            formBox.append(title);

            let description = document.createElement("p");
            description.className = "form__description"
            description.innerHTML = formSchema.description;
            formBox.append(description);

            let closeButton = document.createElement("button");
            closeButton.onclick = () => this.closeForm();
            closeButton.innerText = "x";
            closeButton.className = "form__close-button";
            formBox.append(closeButton);

            if (formSchema.field_type === "NPS") {

                let npsList = document.createElement("ul");
                npsList.className = "form__nps-list";

                const npsListItemHover = (upto: number) => {
                    for (let i = 0; i < upto; i++) {
                        let item = document.getElementById(`nps-list-item-${i + 1}`);
                        if (item) {
                            item.classList.add("form__nps-list__item--active");
                        }
                    }
                }

                const npsListItemHoverRemove = (upto: number) => {
                    for (let i = 0; i < upto; i++) {
                        let item = document.getElementById(`nps-list-item-${i + 1}`);
                        if (item) {
                            item.classList.remove("form__nps-list__item--active");
                        }
                    }
                }

                for (let i = 0; i < 10; i++) {
                    let npsListItem = document.createElement("li");
                    npsListItem.id = `nps-list-item-${i + 1}`;
                    npsListItem.innerHTML = (i + 1).toString();
                    npsListItem.onmouseenter = () => npsListItemHover(i + 1);
                    npsListItem.onmouseleave = () => npsListItemHoverRemove(i + 1);
                    npsListItem.onclick = () => this.submitForm(i + 1);
                    npsListItem.className = "form__nps-list__item";
                    npsList.append(npsListItem)
                }

                formBox.append(npsList)

            }

            if (formSchema.field_type === "FIVE_SCALE") {

                let fiveScaleList = document.createElement("ul");
                fiveScaleList.className = "form__five-scale-list";

                const fiveScaleListItemHover = (upto: number) => {
                    for (let i = 0; i < upto; i++) {
                        let item = document.getElementById(`five-scale-list-item-${i + 1}`);
                        if (item) {
                            item.classList.add("form__five-scale-list__item--active");
                        }
                    }
                }

                const fiveScaleItemHoverRemove = (upto: number) => {
                    for (let i = 0; i < upto; i++) {
                        let item = document.getElementById(`five-scale-list-item-${i + 1}`);
                        if (item) {
                            item.classList.remove("form__five-scale-list__item--active");
                        }
                    }
                }

                for (let i = 0; i < 5; i++) {
                    let fiveScaleListItem = document.createElement("li");
                    fiveScaleListItem.id = `five-scale-list-item-${i + 1}`;
                    fiveScaleListItem.innerHTML = (i + 1).toString();
                    fiveScaleListItem.onmouseenter = () => fiveScaleListItemHover(i + 1);
                    fiveScaleListItem.onmouseleave = () => fiveScaleItemHoverRemove(i + 1);
                    fiveScaleListItem.onclick = () => this.submitForm(i + 1);
                    fiveScaleListItem.className = "form__five-scale-list__item";
                    fiveScaleList.append(fiveScaleListItem)
                }
                formBox.append(fiveScaleList)

            }

            if (formSchema.field_type === "FIVE_STAR") {

                let fiveStarList = document.createElement("ul");
                fiveStarList.className = "form__five-star-list";

                const fiveStarListItemHover = (upto: number) => {
                    for (let i = 0; i < upto; i++) {
                        let item = document.getElementById(`five-star-list-item-star-${i + 1}`);
                        if (item) {
                            item.className = "form__five-star-list__item__star--active";
                        }
                    }
                }

                const fiveStarItemHoverRemove = (upto: number) => {
                    for (let i = 0; i < upto; i++) {
                        let item = document.getElementById(`five-star-list-item-star-${i + 1}`);
                        if (item) {
                            item.className = "form__five-star-list__item__star";
                        }
                    }
                }

                for (let i = 0; i < 5; i++) {
                    let fiveStarListItem = document.createElement("li");
                    fiveStarListItem.id = `five-star-list-item-${i + 1}`;
                    let starItem = document.createElement("i");
                    starItem.id = `five-star-list-item-star-${i + 1}`;
                    starItem.className = "form__five-star-list__item__star";
                    fiveStarListItem.onmouseenter = () => fiveStarListItemHover(i + 1);
                    fiveStarListItem.onmouseleave = () => fiveStarItemHoverRemove(i + 1);
                    fiveStarListItem.onclick = () => this.submitForm(i + 1);
                    fiveStarListItem.append(starItem)
                    fiveStarListItem.className = "form__five-star-list__item";
                    fiveStarList.append(fiveStarListItem)
                }
                formBox.append(fiveStarList)

            }

            if (formSchema.field_type === "TEXT") {
                let textBox = document.createElement("textarea");
                textBox.className = "form__text-box";
                textBox.placeholder = formSchema.field_data.placeholder;
                formBox.append(textBox);

                formBox.append(document.createElement("br"));
                let proceedButton = document.createElement("button");
                proceedButton.onclick = () => this.submitForm(textBox.value);
                proceedButton.innerText = "Proceed";
                proceedButton.className = "form__submit-button";
                formBox.append(proceedButton);
            }

            if (formSchema.field_type === "EMOJI") {
                let emojiList = document.createElement("ul");
                emojiList.className = "form__emoji-list";

                for (let i = 0; i < 5; i++) {
                    let emojiListItem = document.createElement("li");
                    emojiListItem.id = `emoji-list-item-${i + 1}`;
                    emojiListItem.innerHTML = `<span>${i + 1 === 1 ? "😖" : i + 1 === 2 ? "😕" : i + 1 === 3 ? "😐" : i + 1 === 4 ? "😃" : "😍"}</span>`;
                    emojiListItem.onclick = () => this.submitForm(i + 1);
                    emojiListItem.className = "form__emoji-list__item";
                    emojiList.append(emojiListItem)
                }
                formBox.append(emojiList)
            }

            if (formSchema.field_type === "CHOICE") {
                let optionsList = document.createElement("ul");
                let selectedOptions: Array<any> = [];
                optionsList.className = "form__options-list";

                const toggleOption = (index: number, option: any) => {
                    let presence = selectedOptions.find(op => op === option);
                    let optionElement = document.getElementById(`option-${index}`);
                    if (!presence) {
                        selectedOptions.push(option);
                        if (optionElement) {
                            optionElement.classList.add("form__options-list__item--active");
                        }
                    } else {
                        selectedOptions.splice(selectedOptions.findIndex(op => op === option));
                        if (optionElement) {
                            optionElement.classList.remove("form__options-list__item--active");
                        }
                    }
                }

                formSchema.field_data.options.forEach((option: any, index: number) => {
                    let optionsListItem = document.createElement("li");
                    optionsListItem.className = "form__options-list__item";
                    optionsListItem.id = `option-${index}`;
                    optionsListItem.innerHTML = `<span>${option}</span>`
                    optionsListItem.onclick = () => { formSchema.field_data.type === "MULTISELECT" ? toggleOption(index, option) : this.submitForm(option) };
                    optionsList.append(optionsListItem)
                })

                formBox.append(optionsList);

                if (formSchema.field_data.type === "MULTISELECT") {
                    let proceedButton = document.createElement("button");
                    proceedButton.onclick = () => this.submitForm(selectedOptions);
                    proceedButton.innerText = "Proceed";
                    proceedButton.className = "form__submit-button";
                    formBox.append(proceedButton);
                }

            }
        }
    }

}
