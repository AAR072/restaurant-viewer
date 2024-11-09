type ChecklistCallback = (selections: string[] | null) => void;

/** Holds functionality for a checklist, including a default any option and an option limit. */
class Checklist {
  public optionNames: string[];
  public optionInputs: HTMLInputElement[];
  public optionCount: number = 0;

  public anyOption?: HTMLInputElement;

  /** Currently checked options. */
  public checked: boolean[];
  /** Amount of currently checked options. */
  public checkCount: number = 0;
  /** The current value of the checklist, being null if any option is checked and the checked names if otherwise. */
  public value: string[] | null;

  private callback: ChecklistCallback;

  /**
   * Creates a new checklist instance and applies checklist logic to the specified element.
   * @param element The element to apply checklist logic to.
   * @param options The option names of the checklist.
   * @param anyOption True if "any" option should be included, false if otherwise.
   * @param maxOptions Optional parameter for option limit.
   * @timecomplexity O(1)
   */
  constructor(
    public element: HTMLDivElement,
    options: string[],
    anyOption: boolean,
    public maxOptions?: number
  ) {
    element.className = 'checklist-container';

    // Create any option checkbox if specified
    if (anyOption) {
      this.anyOption = this.createCheckbox('Any');
      this.anyOption.checked = true;

      this.anyOption.addEventListener('input', () => {
        this.update();
      });
    }

    // Set option names and create option inputs and checked arrays
    this.optionNames = options;
    this.optionCount = options.length;
    this.optionInputs = new Array(this.optionCount);
    this.checked = new Array(this.checkCount);

    // Create options
    for (let i: number = 0; i < this.optionCount; i++) {
      this.createOption(i);
    }

    this.update();
  }

  /**
   * Creates checkbox option elements.
   * @param display The display name of the option.
   * @returns The created checkbox input element.
   * @timecomplexity O(1)
   */
  private createCheckbox(display: string): HTMLInputElement {
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'checklist-option';

    const label: HTMLLabelElement = document.createElement('label');
    label.innerText = display;

    const checkbox: HTMLInputElement = document.createElement(
      'input'
    ) as HTMLInputElement;
    checkbox.type = 'checkbox';

    container.appendChild(checkbox);
    container.appendChild(label);

    this.element.appendChild(container);

    return checkbox;
  }

  /**
   * Updates the checked info for a checklist option.
   * @param index The index of the option being checked/changed.
   * @timecomplexity O(1)
   */
  private checkOption(index: number): void {
    const isChecked: boolean = this.optionInputs[index].checked;

    if (isChecked) {
      if (this.anyOption && this.anyOption.checked) {
        this.anyOption.checked = false;
      } // Unchecks "any" option if currently checked

      this.checked[index] = true;
      this.checkCount++;
    } else {
      this.checked[index] = false;
      this.checkCount--;
    }

    this.update();
  }

  /**
   * Update the checkbox display, value and fire the callback with the updated value.
   * @timecomplexity O(1)
   */
  private update(): void {
    if (this.anyOption && this.anyOption.checked) {
      // Set value to null if "any" option is checked
      this.value = null;
    } else {
      // Set value to checked options
      const selected: string[] = new Array(this.checkCount);
      let selectPointer: number = 0;

      if (this.maxOptions && this.checkCount >= this.maxOptions) {
        // Fill selected array and disable non checked checkboxes to prevent limit being exceeded
        for (let i: number = 0; i < this.optionCount; i++) {
          if (this.checked[i]) {
            selected[selectPointer++] = this.optionNames[i];
          } else {
            this.optionInputs[i].disabled = true;
          }
        }
      } else {
        for (let i: number = 0; i < this.optionCount; i++) {
          // Fill selected array and enable all checkboxes
          if (this.checked[i]) selected[selectPointer++] = this.optionNames[i];

          this.optionInputs[i].disabled = false;
        }
      }

      this.value = selected;
    }

    if (this.callback) this.callback(this.value); // Fire callback with updated value
  }

  /**
   * Create an option's elements and information in the arrays and setup its checkbox's event listener.
   * @param index The index of the option.
   * @timecomplexity O(1)
   */
  private createOption(index: number): void {
    const name: string = this.optionNames[index];

    const checkbox: HTMLInputElement = this.createCheckbox(
      name.substring(0, 1).toUpperCase() + name.substring(1)
    );

    this.optionInputs[index] = checkbox;

    checkbox.addEventListener('input', () => {
      this.checkOption(index);
    });
  }

  /**
   * Adds a listener callback to be called when the checklist is updated.
   * @param callback The listener callback.
   */
  public addListener(callback: ChecklistCallback): void {
    this.callback = callback;
  }
}
