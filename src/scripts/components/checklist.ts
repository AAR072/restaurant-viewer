type ChecklistCallback = (selections: string[] | null) => any;

class Checklist {
  public checked: string[] = [];
  public checkCount: number = 0;

  private callback: ChecklistCallback;

  constructor(public element: HTMLDivElement, anyOption: boolean) {
    if (anyOption) this.addOption("any", true, "Any")
  }

  private checkOption(name: string, isAny: boolean, check: boolean) {
    if (isAny) {
      if (this.callback) {
        if (check) this.callback(null);
        else this.callback(this.checked);
      }

      return;
    }

    if (check) {
      this.checked[this.checkCount++] = name;

    } else {
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
      this.checkOption(name, isAny, checkbox.checked);
    });

    this.element.appendChild(container);
  }

  public addListener(callback: ChecklistCallback) {
    this.callback = callback;
  }
}