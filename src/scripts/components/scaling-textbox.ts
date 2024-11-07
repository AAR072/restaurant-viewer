type STCallback = () => any;

class ScalingTextbox {
  public value: number = 0;

  private listener: STCallback;

  constructor(public element: HTMLSpanElement, public decimalPlaces: number, defaultVal?: number) {
    element.className = "scaling-textbox";
    element.contentEditable = "true";

    element.addEventListener("keydown", (event: KeyboardEvent) => {
      const key = event.key;

      if (key == "Enter") this.update();
      else if (key == "Backspace" || key == "ArrowLeft" || key == "ArrowRight" || key == "-") return;
      else if (!isNaN(parseFloat(key))) return;
      else if (key == "." && decimalPlaces > 0) return;

      event.preventDefault();
    });

    element.addEventListener("blur", () => {
      this.update();
    });

    if (defaultVal != null) this.setValue(defaultVal);
  }

  private update() {
    let value;

    if (this.decimalPlaces > 0) value = parseFloat(this.element.innerText);
    else value = parseInt(this.element.innerText);

    if (!isNaN(value)) this.value = value;
    else this.setValue(this.value);

    if (this.listener) this.listener();
    // >:)
    app.displayMap.render();
  }

  public addListener(callback: STCallback) {
    this.listener = callback;
  }

  public setValue(value: number) {
    this.value = value;
    this.element.innerText = value.toFixed(this.decimalPlaces).toString();

    if (document.activeElement == this.element) {
      const range = document.createRange();
      range.selectNodeContents(this.element);
      range.collapse(false);

      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}
