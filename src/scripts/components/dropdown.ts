/** Creates and handles all dropdown functionality for a div element. */
class Dropdown {
  /** The currently "opened" down dropdown. */
  static currentDropdown: Dropdown | null = null;

  public content: HTMLDivElement;

  /**
   * Creates a dropdown instance, allowing an element to function as a dropdown.
   * @param element The div element to apply dropdown logic to.
   * @timecomplexity O(1)
   */
  constructor(public element: HTMLDivElement) {
    const button: HTMLButtonElement = element.querySelector(
      '.dropdown-button'
    ) as HTMLButtonElement;
    const content: HTMLDivElement = element.querySelector(
      '.dropdown-content'
    ) as HTMLDivElement;

    this.content = content;
    this.updateHeight();

    element.classList.add('hide');

    button.addEventListener('click', () => {
      if (Dropdown.currentDropdown === this) {
        // If the dropdown is already down then hide it
        this.up();
      } else {
        // Otherwise drop down
        this.down();
      }
    });
  }

  /**
   * Updates and defines the height of the dropdown content so that it can be animated.
   * @timecomplexity O(1)
   */
  private updateHeight(): void {
    this.content.style.height = this.content.scrollHeight + 'px';
  }

  /**
   * Hides the dropdown.
   * @timecomplexity O(1)
   */
  public up(): void {
    this.updateHeight();
    this.element.classList.add('hide');

    Dropdown.currentDropdown = null;
  }

  /**
   * Drops down the dropdown and hides the currently visible dropdown.
   * @timecomplexity O(1)
   */
  public down(): void {
    if (Dropdown.currentDropdown) Dropdown.currentDropdown.up();

    this.updateHeight();
    this.element.classList.remove('hide');

    Dropdown.currentDropdown = this;
  }
}
