type ChecklistCallback = (selections: string[] | null) => any;

interface CheckOption {
  name: string,
  element: HTMLInputElement
}

class Checklist {
  public optionNames: string[];
  public optionInputs: HTMLInputElement[];
  public optionCount: number = 0;

  public anyOption?: HTMLInputElement;

  public checked: boolean[];
  public checkCount: number = 0;
  public value: string[] | null;

  private callback: ChecklistCallback;

  constructor(public element: HTMLDivElement, options: string[], anyOption: boolean, public maxOptions?: number) {
    element.className = "checklist-container";

    if (anyOption) {
      this.anyOption = this.createCheckbox("Any");
      this.anyOption.checked = true;

      this.anyOption.addEventListener("input", () => {
        this.update();
      });
    }

    this.optionNames = options;
    this.optionCount = options.length;
    this.optionInputs = new Array(this.optionCount);
    this.checked = new Array(this.checkCount);

    for (let i = 0; i < this.optionCount; i++) {
      this.createOption(i);
    }

    this.update();
  }

  private createCheckbox(display: string): HTMLInputElement {
    const container = document.createElement("div");
    container.className = "checklist-option";
    
    const label = document.createElement("label");
    label.innerText = display;

    const checkbox = document.createElement("input") as HTMLInputElement;
    checkbox.type = "checkbox";

    container.appendChild(checkbox);
    container.appendChild(label);

    this.element.appendChild(container);

    return checkbox;
  }

  private checkOption(index: number) {
    const isChecked = this.optionInputs[index].checked;

    if (isChecked) {
      if (this.anyOption && this.anyOption.checked) this.anyOption.checked = false;

      this.checked[index] = true;
      this.checkCount++;

    } else {
      this.checked[index] = false;
      this.checkCount--;
    }

    this.update();
  }

  private update() {
    if (this.anyOption && this.anyOption.checked) {
      this.value = null;

    } else {
      const selected: string[] = new Array(this.checkCount);
      let selectPointer: number = 0;

      if (this.maxOptions && this.checkCount >= this.maxOptions) {
        for (let i = 0; i < this.optionCount; i++) {
          if (this.checked[i]) {
            selected[selectPointer++] = this.optionNames[i];

          } else {
            this.optionInputs[i].disabled = true;
          }
        }

      } else {
        for (let i = 0; i < this.optionCount; i++) {
          if (this.checked[i]) selected[selectPointer++] = this.optionNames[i];

          this.optionInputs[i].disabled = false;
        }
      }

      this.value = selected;
    }

    if (this.callback) this.callback(this.value);
  }

  private createOption(index: number) {
    const name = this.optionNames[index];

    const checkbox = this.createCheckbox(name.substring(0, 1).toUpperCase() + name.substring(1));

    this.optionInputs[index] = checkbox;
    this.optionInputs[index] = checkbox;
    
    checkbox.addEventListener("input", () => {
      this.checkOption(index);
    });
  }

  public addListener(callback: ChecklistCallback) {
    this.callback = callback;
  }
}