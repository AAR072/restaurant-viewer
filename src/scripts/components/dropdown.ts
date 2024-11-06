class Dropdown {
  static currentDropdown: Dropdown | null = null;

  public content: HTMLDivElement;

  constructor(public element: HTMLDivElement) {
    const button = element.querySelector(".dropdown-button") as HTMLButtonElement;
    const content = element.querySelector(".dropdown-content") as HTMLDivElement;

    this.content = content;

    this.updateHeight();

    element.classList.add("hide");

    button.addEventListener("click", () => {
      const current = Dropdown.currentDropdown;

      if (current == this) {
        this.up();

      } else {
        if (current) current.up();

        this.down();
      }
    });
  }

  private updateHeight() {
    this.content.style.height = (this.content.scrollHeight) + "px";
  }

  public up() {
    this.updateHeight();
    this.element.classList.add("hide");
    
    Dropdown.currentDropdown = null;
  }

  public down() {
    this.updateHeight();
    this.element.classList.remove("hide");

    Dropdown.currentDropdown = this;
  }
}

document.querySelectorAll(".dropdown").forEach((element: Element) => {
  new Dropdown(element as HTMLDivElement);
});