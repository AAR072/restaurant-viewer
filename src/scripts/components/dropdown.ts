class Dropdown {
  static currentDropdown: Dropdown | null = null;

  constructor(public element: HTMLDivElement) {
    const button = element.querySelector(".dropdown-button") as HTMLButtonElement;
    const content = element.querySelector(".dropdown-content") as HTMLDivElement;

    content.style.height = (content.scrollHeight) + "px";
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

  public up() {
    this.element.classList.add("hide");
    
    Dropdown.currentDropdown = null;
  }

  public down() {
    this.element.classList.remove("hide");

    Dropdown.currentDropdown = this;
  }
}

document.querySelectorAll(".dropdown").forEach((element: Element) => {
  new Dropdown(element as HTMLDivElement);
});