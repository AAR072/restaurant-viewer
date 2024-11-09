type STCallback = () => void;

/** Creates and holds custom textbox functionalities for a span element. */
class ScalingTextbox {
  public value: number = 0;

  private listener: STCallback;

  /**
   * Creates a new scaling textbox instance from a span element and applies all relevant functionality.
   * @param element The element to apply the scaling textbox logic to.
   * @param decimalPlaces The amount of decimal places input should have.
   * @param defaultVal The optional default value of the textbox upon instantiation.
   * @timecomplexity O(1)
   */
  constructor(
    public element: HTMLSpanElement,
    public decimalPlaces: number,
    defaultVal?: number
  ) {
    element.className = 'scaling-textbox';
    element.contentEditable = 'true';

    element.addEventListener('keydown', (event: KeyboardEvent) => {
      const key: string = event.key;

      if (key === 'Enter') {
        this.update();
      } // Update value if enter is pressed
      else if (
        key === 'Backspace' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === '-'
      ) {
        return;
      } // Allow input if any of these keys
      else if (!isNaN(parseFloat(key))) {
        return;
      } // Allow input if it is a number
      else if (key === '.' && decimalPlaces > 0) {
        return;
      } // Allow period if decimals are included

      event.preventDefault();
    });

    element.addEventListener('blur', () => {
      this.update();
    });

    if (defaultVal !== undefined) this.setValue(defaultVal!);
  }

  /**
   * Reads and updates the value of the textbox and calls the current listener callback.
   * @timecomplexity O(1)
   */
  private update(): void {
    let value: number;

    if (this.decimalPlaces > 0) value = parseFloat(this.element.innerText);
    else value = parseInt(this.element.innerText);

    if (!isNaN(value)) this.value = value;
    else this.setValue(this.value);

    if (this.listener) this.listener();

    app.displayMap.render();
  }

  /**
   * Sets the callback for the textbox to be called whenever the input updates.
   * @param callback The listener callback.
   * @timecomplexity O(1)
   */
  public addListener(callback: STCallback): void {
    this.listener = callback;
  }

  /**
   * Manually sets the value and display of the textbox without firing the callback.
   * @param value The new value to set the textbox's value to.
   * @timecomplexity O(1)
   */
  public setValue(value: number): void {
    this.value = value;
    this.element.innerText = value.toFixed(this.decimalPlaces).toString();

    // Place cursor at end of span if currently inside the span
    if (document.activeElement === this.element) {
      const range: Range = document.createRange();
      range.selectNodeContents(this.element);
      range.collapse(false);

      const selection: Selection | null = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}
