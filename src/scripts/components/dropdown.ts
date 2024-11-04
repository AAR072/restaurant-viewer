class Dropdown {
  constructor(element: HTMLDivElement) {
    const button = element.querySelector(".drop-button") as HTMLButtonElement;
    const content = element.querySelector(".drop-content") as HTMLDivElement;

    button.addEventListener("click", () => {
      content.classList.toggle("show");
    });
  }

  public addOption() {

  }
}

document.querySelectorAll(".dropdown").forEach((element: Element) => {
  new Dropdown(element as HTMLDivElement);
});