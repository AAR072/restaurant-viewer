class Dropdown {
  static currentDropdown: Dropdown | null = null;

  constructor(public element: HTMLDivElement) {
    const button = element.querySelector(".dropdown-button") as HTMLButtonElement;
    const content = element.querySelector(".dropdown-content") as HTMLDivElement;

    content.style.height = content.scrollHeight + "px";

    this.up();

    button.addEventListener("click", () => {
      if (Dropdown.currentDropdown == this) {
        this.up();

      } else {
        this.down()
      }
    });
  }

  public up() {
    this.element.classList.add("hide");
    
    if (Dropdown.currentDropdown == this) Dropdown.currentDropdown = null;
  }

  public down() {
    if (Dropdown.currentDropdown) Dropdown.currentDropdown.up();

    this.element.classList.remove("hide");

    Dropdown.currentDropdown = this;
  }
}

document.querySelectorAll(".dropdown").forEach((element: Element) => {
  new Dropdown(element as HTMLDivElement);
});