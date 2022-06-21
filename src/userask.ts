import axios from "axios";
import "./userask.scss";

interface InitProps {
    projectId: string
    userId: string
    userMeta: any
}

export class UserAsk {

    private projectId: string;
    private requestId: string;
    private userId: string;
    private userMeta: any;
    private flowMeta: any;

    private readonly apiURL: string = "https://beta.userask.co/public/api/v1/execution";

    constructor() {
        this.projectId = "";
        this.requestId = "";
        this.userId = "";
        this.userMeta = {};
        this.flowMeta = {};
    }

    public async init(props: InitProps) {
        try {
            this.projectId = props.projectId;
            this.userId = props.userId;
            this.userMeta = props.userMeta;
            this.createFormBox();
        } catch (err) {
            console.log("ERROR: Failed initializing userask object");
        }
    }

    // creates a form box initally
    private createFormBox() {
        if (!document.getElementById("userask-form")) {
            let formBox = document.createElement("div");
            formBox.id = "userask-form";
            formBox.className = "userask-form-box";
            formBox.style.display = "none";
            document.body.append(formBox);
        }
    }

    // calls to show survey
    public async showSurvey(identifier: string, flow_meta: any = null) {
        if (identifier === null) {
            throw new Error("no event identifier is present");
        }

        let flow_data = {
            identifier: identifier,
            project_id: this.projectId,
            user_id: this.userId,
            user_meta: this.userMeta,
            flow_meta: this.flowMeta
        }

        if (flow_meta) {
            flow_data["flow_meta"] = flow_meta;
            this.flowMeta = flow_meta;
        }

        let root = document.documentElement;
        let response = await axios.post(`${this.apiURL}/show-flow`, flow_data);

        if (response.data !== null) {
            root.style.setProperty("--userask-theme", response.data.theme);
            this.requestId = response.data.request_id;
            this.renderForm(response.data.form_data);
        } else {
            return { status: "event logged" };
        }
    }

    // submits the form
    private async submitForm(responseData: any) {
        try {
            this.renderSpinner();
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
                    setTimeout(() => {
                        if (formBox) {
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

    private closeForm() {
        let formBox = document.getElementById("userask-form");
        if (formBox) {
            formBox.innerHTML = "";
            formBox.style.display = "none";
        }
    }

    private successPage() {
        let formBox = document.getElementById("userask-form");

        if (formBox) {
            formBox.innerHTML = "";

            formBox.style.display = "inherit";

            let endPage = document.createElement("div");
            endPage.className = "form__endpage";

            let title = document.createElement("h1");
            title.className = "form__title"
            title.innerHTML = "Thank you for providing feedback";
            endPage.append(title);

            let description = document.createElement("p");
            description.className = "form__description"
            description.innerHTML = "✅ Your response has been saved";
            endPage.append(description);

            let closeButton = document.createElement("button");
            closeButton.onclick = () => this.closeForm();
            closeButton.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L14 14M14 1L1 14" stroke="#4D4B4B" stroke-width="1.5"/>
                </svg>
            `;
            closeButton.className = "form__close-button";

            endPage.append(closeButton);

            formBox.append(endPage);
        }
    }

    private renderSpinner() {

        let formBox = document.getElementById("userask-form");

        if (formBox) {
            formBox.innerHTML = "";
            formBox.style.display = "inherit";
            let spinnerContainer = document.createElement("div");
            spinnerContainer.className = "form__spinner-container";
            let spinner = document.createElement("div");
            spinner.className = "form__spinner-container__spinner";
            spinnerContainer.append(spinner)
            formBox.append(spinnerContainer);
        }

    }

    private renderLiquidToText(text: string) {
        let words = text.split(" ");
        let constructed_string = "";

        let data: any = {
            user_meta: this.userMeta,
            flow_meta: this.flowMeta
        }

        for(let word of words) {
          if(word[0] == "{" && word[1] == "{" && word[word.length - 2] == "}" && word[word.length - 1] == "}") {
            let spliced_word = word.slice(2, -2);
            let split_word = spliced_word.split(".");
            if (typeof data[split_word[0]][split_word[1]] === "undefined") {
              constructed_string += " ";
            } else {
              constructed_string += data[split_word[0]][split_word[1]] + " ";
            }
          } else {
            constructed_string += word + " ";
          }
        }

        return constructed_string;
    }

    private renderForm(formSchema: any) {
        let formBox = document.getElementById("userask-form");

        if (formBox) {

            formBox.innerHTML = "";

            formBox.style.display = "inherit";

            let title = document.createElement("h1");
            title.className = "form__title"
            title.innerHTML = this.renderLiquidToText(formSchema.title);
            formBox.append(title);

            let description = document.createElement("p");
            description.className = "form__description"
            description.innerHTML = this.renderLiquidToText(formSchema.description);
            formBox.append(description);

            let closeButton = document.createElement("button");
            closeButton.onclick = () => this.closeForm();
            closeButton.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L14 14M14 1L1 14" stroke="#4D4B4B" stroke-width="1.5"/>
                </svg>
            `;
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

                let scaleText = document.createElement("div");
                scaleText.innerHTML = `<p>Not Likely</p><p>Extremely Likely</p>`;
                scaleText.className = "form__scale-text";

                formBox.append(npsList)
                formBox.append(scaleText);

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

                let scaleText = document.createElement("div");
                scaleText.innerHTML = `<p>Not Likely</p><p>Extremely Likely</p>`;
                scaleText.className = "form__scale-text";

                formBox.append(fiveScaleList)
                formBox.append(scaleText)

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

                let scaleText = document.createElement("div");
                scaleText.innerHTML = `<p>Not Likely</p><p>Extremely Likely</p>`;
                scaleText.className = "form__scale-text";


                formBox.append(fiveStarList)
                formBox.append(scaleText)

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

                let scaleText = document.createElement("div");
                scaleText.innerHTML = `<p>Unhappy</p><p>Happy</p>`;
                scaleText.className = "form__scale-text";

                formBox.append(emojiList)
                formBox.append(scaleText)
            }

            if (formSchema.field_type === "CHOICE") {
                let optionsList = document.createElement("ul");
                let selectedOptions: any = [];
                optionsList.className = "form__options-list";

                const toggleOption = (index: number, option: any) => {
                    let presence = selectedOptions.find((op: any) => op === option);
                    let optionElement = document.getElementById(`option-${index}`);
                    if (!presence) {
                        selectedOptions.push(option);
                        if (optionElement) {
                            optionElement.classList.add("form__options-list__item--active");
                        }
                    } else {
                        selectedOptions.splice(selectedOptions.findIndex((op: any) => op === option));
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
