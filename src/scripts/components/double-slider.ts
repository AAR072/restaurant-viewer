type DSCallback = (min: number, max: number, fullRange: boolean) => void;

/** Holds double slider functionality for a div element containing all relevant elements. */
class DoubleSlider {
  /** The value of the first slider or the "minimum". */
  public min: number = 0;
  /** The value of the second slider or the "maximum". */
  public max: number = 0;
  /** The value in which the min and max change by. */
  public interval: number;

  public progress: HTMLDivElement;
  public minSlider: HTMLInputElement;
  public maxSlider: HTMLInputElement;
  public minTextDisplay: HTMLSpanElement;
  public maxTextDisplay: HTMLSpanElement;
  public minTextbox: ScalingTextbox;
  public maxTextbox: ScalingTextbox;

  public eventCallback: DSCallback;

  /**
   * Creates and initializes double slider functionalities and logic to a div element.
   * @param element The element to apply double slider logic to.
   * @param rangeMin The minimum possible value for both sliders.
   * @param rangeMax The maximum possible value for both sliders.
   * @param decimalPlaces The amount of decimal places to include for the slider textboxes.
   * @timecomplexity O(1)
   */
  constructor(
    public element: HTMLDivElement,
    public rangeMin: number,
    public rangeMax: number,
    public decimalPlaces: number
  ) {
    const progress: HTMLDivElement = element.querySelector(
      '.progress'
    ) as HTMLDivElement;
    const minSlider: HTMLInputElement = element.querySelector(
      '.min-range'
    ) as HTMLInputElement;
    const maxSlider: HTMLInputElement = element.querySelector(
      '.max-range'
    ) as HTMLInputElement;
    const minTextDisplay: HTMLSpanElement = element.querySelector(
      '.slider-min-text'
    ) as HTMLSpanElement;
    const maxTextDisplay: HTMLSpanElement = element.querySelector(
      '.slider-max-text'
    ) as HTMLSpanElement;
    const minTextSpan: HTMLSpanElement = minTextDisplay.querySelector('span')!;
    const maxTextSpan: HTMLSpanElement = maxTextDisplay.querySelector('span')!;

    // Create scaling textboxes for the slider
    this.minTextbox = new ScalingTextbox(minTextSpan, decimalPlaces);
    this.maxTextbox = new ScalingTextbox(maxTextSpan, decimalPlaces);

    this.interval = 10 ** -decimalPlaces; // i.e. decimalPlaces = 1, interval = 0.1 or decimalPlaces = 2, interval = 0.01

    minSlider.min = maxSlider.min = rangeMin.toString();
    minSlider.max = maxSlider.max = rangeMax.toString();
    minSlider.step = maxSlider.step = this.interval.toString();

    this.progress = progress;
    this.minSlider = minSlider;
    this.maxSlider = maxSlider;
    this.minTextDisplay = minTextDisplay;
    this.maxTextDisplay = maxTextDisplay;

    minSlider.addEventListener('input', () => {
      this.updateSlider(
        parseFloat(minSlider.value),
        parseFloat(maxSlider.value),
        true
      );
    });

    maxSlider.addEventListener('input', () => {
      this.updateSlider(
        parseFloat(minSlider.value),
        parseFloat(maxSlider.value),
        false
      );
    });

    minSlider.addEventListener('mouseup', () => {
      this.fireListener();
    });

    maxSlider.addEventListener('mouseup', () => {
      this.fireListener();
    });

    this.minTextbox.addListener(() => {
      this.updateSlider(this.minTextbox.value, this.maxTextbox.value, true);
      this.fireListener();
    });

    this.maxTextbox.addListener(() => {
      this.updateSlider(this.minTextbox.value, this.maxTextbox.value, false);
      this.fireListener();
    });

    this.updateSlider(this.rangeMin, this.rangeMax, false);
  }

  /**
   * Gets the percentage progress `value` from the slider minimum value to the slider maximum value.
   * @param value The value used.
   * @returns The percentage between minimum and maximum.
   */
  private getRangePct(value: number): number {
    return (value - this.rangeMin) / (this.rangeMax - this.rangeMin);
  }

  /**
   * Updates the slider based on updated slider 1 and slider 2 values and displays new information.
   * @param minVal The updated value of slider 1.
   * @param maxVal The updated value of slider 2.
   * @param min True if it is the first slider (minimum slider), false if it is the second (maximum slider).
   * @timecomplexity O(1)
   */
  private updateSlider(minVal: number, maxVal: number, min: boolean): void {
    // Ensure min does not exceed max and max does not go under min
    if (min) minVal = getMin(minVal, maxVal - this.interval);
    else maxVal = getMax(maxVal, minVal + this.interval);

    // Clamp min and max values between maximum and minimum range of the slider
    minVal = clamp(minVal, this.rangeMin, this.rangeMax);
    maxVal = clamp(maxVal, this.rangeMin, this.rangeMax);

    this.min = minVal;
    this.max = maxVal;

    const pctLeft: number = this.getRangePct(minVal) * 100;
    const pctRight: number = (1 - this.getRangePct(maxVal)) * 100;

    this.minTextbox.setValue(minVal);
    this.maxTextbox.setValue(maxVal);

    this.minSlider.value = minVal.toString();
    this.maxSlider.value = maxVal.toString();

    // Position progress bar between min and max
    this.progress.style.left = pctLeft + '%';
    this.progress.style.right = pctRight + '%';

    // Position text displays above corresponding slider thumbsticks
    this.minTextDisplay.style.left = pctLeft + '%';
    this.maxTextDisplay.style.right = pctRight + '%';
  }

  /**
   * Fires the listener callback with the min and max values, as well as whether or not the slider has not been changed (full range).
   * @timecomplexity O(1)
   */
  private fireListener(): void {
    if (this.eventCallback) {
      this.eventCallback(
        this.min,
        this.max,
        this.min === this.rangeMin && this.max === this.rangeMax
      );
    }
  }

  /**
   * Sets the listener callback to be called whenever the double slider's value changes.
   * @param callback The listener callback.
   * @timecomplexity O(1)
   */
  public addListener(callback: DSCallback): void {
    this.eventCallback = callback;
  }
}
