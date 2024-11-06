type ChecklistCallback = (selections: string[] | null) => any;

class Checklist {
  public checked: string[] = [];
  public checkCount: number = 0;
  public anyCheckbox?: HTMLInputElement;

  private callback: ChecklistCallback;

  constructor(public element: HTMLDivElement, anyOption: boolean, public maxOptions?: number) {
    if (anyOption) {
      this.anyCheckbox = this.createCheckbox("Any");
      this.anyCheckbox.checked = true;

      this.anyCheckbox.addEventListener("input", () => {
        this.fireListener();
      });
    }
  }

  private createCheckbox(display: string): HTMLInputElement {
    const container = document.createElement("div");
    
    const label = document.createElement("label");
    label.innerText = display;

    const checkbox = document.createElement("input") as HTMLInputElement;
    checkbox.type = "checkbox";

    container.appendChild(checkbox);
    container.appendChild(label);

    this.element.appendChild(container);

    return checkbox;
  }

  private checkOption(name: string, check: boolean) {
    if (check) {
      this.checked[this.checkCount++] = name;

    } else {
      if (this.maxOptions != null && this.checkCount >= this.maxOptions) return;

      for (let i = 0; i < this.checkCount; i++) {
        if (this.checked[i] == name) {
          this.checked[i] = this.checked[this.checkCount - 1];
          this.checked.length--;
          this.checkCount--;

          break;
        }
      }
    }

    if (this.callback) this.callback(this.checked);
  }

  private fireListener() {
    if (!this.callback) return;

    if (this.anyCheckbox && this.anyCheckbox.checked) this.callback(null);
    else this.callback(this.checked);
  }

  public addOption(name: string, isAny: boolean, displayName: string) {
    const container = document.createElement("div");
    
    const label = document.createElement("label");
    label.innerText = displayName;

    const checkbox = document.createElement("input") as HTMLInputElement;
    checkbox.type = "checkbox";

    if (isAny) checkbox.checked = true;

    container.appendChild(checkbox);
    container.appendChild(label);

    checkbox.addEventListener("input", () => {
      this.checkOption(name, checkbox.checked);
    });

    this.element.appendChild(container);
  }

  public addListener(callback: ChecklistCallback) {
    this.callback = callback;
  }
}