type DSCallback = (min: number, max: number) => any;

class DoubleSlider {
  public min: number = 0;
  public max: number = 0;
  public interval: number;

  public progress: HTMLDivElement;
  public minSlider: HTMLInputElement;
  public maxSlider: HTMLInputElement;
  public minTextDisplay: HTMLSpanElement;
  public maxTextDisplay: HTMLSpanElement;
  public minTextbox: ScalingTextbox;
  public maxTextbox: ScalingTextbox;
  public eventCallback: DSCallback;

  constructor(
    public element: HTMLDivElement,
    public rangeMin: number,
    public rangeMax: number,
    public decimalPlaces: number
  ) {
    const progress = element.querySelector(".progress") as HTMLDivElement;
    const minSlider = element.querySelector(".min-range") as HTMLInputElement;
    const maxSlider = element.querySelector(".max-range") as HTMLInputElement;
    const minTextDisplay = element.querySelector(".slider-min-text") as HTMLSpanElement;
    const maxTextDisplay = element.querySelector(".slider-max-text") as HTMLSpanElement;
    const minTextSpan = minTextDisplay.querySelector("span")!;
    const maxTextSpan = maxTextDisplay.querySelector("span")!;

    this.minTextbox = new ScalingTextbox(minTextSpan, decimalPlaces);
    this.maxTextbox = new ScalingTextbox(maxTextSpan, decimalPlaces);

    this.interval = 10**-decimalPlaces;

    minSlider.min = maxSlider.min = rangeMin.toString();
    minSlider.max = maxSlider.max = rangeMax.toString();
    minSlider.step = maxSlider.step = this.interval.toString();

    this.progress = progress;
    this.minSlider = minSlider;
    this.maxSlider = maxSlider;
    this.minTextDisplay = minTextDisplay;
    this.maxTextDisplay = maxTextDisplay;

    minSlider.addEventListener("input", () => {
      this.updateSlider(parseFloat(minSlider.value), parseFloat(maxSlider.value), true);
    });

    maxSlider.addEventListener("input", () => {
      this.updateSlider(parseFloat(minSlider.value), parseFloat(maxSlider.value), false);
    });

    minSlider.addEventListener("mouseup", () => {
      this.fireListener();
    });

    maxSlider.addEventListener("mouseup", () => {
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

  private getRangePct(value: number) {
    return (value - this.rangeMin)/(this.rangeMax - this.rangeMin);
  }

  private updateSlider(minVal: number, maxVal: number, min: boolean) {
    if (min) minVal = getMin(minVal, maxVal - this.interval);
    else maxVal = getMax(maxVal, minVal + this.interval);

    minVal = clamp(minVal, this.rangeMin, this.rangeMax);
    maxVal = clamp(maxVal, this.rangeMin, this.rangeMax);

    this.min = minVal;
    this.max = maxVal;

    const pctLeft = this.getRangePct(minVal)*100;
    const pctRight = (1 - this.getRangePct(maxVal))*100;

    this.minTextbox.setValue(minVal);
    this.maxTextbox.setValue(maxVal);

    this.minSlider.value = minVal.toString();
    this.maxSlider.value = maxVal.toString();

    this.progress.style.left = pctLeft + "%";
    this.progress.style.right = pctRight + "%";

    this.minTextDisplay.style.left = pctLeft + "%";
    this.maxTextDisplay.style.right = pctRight + "%";
  }

  private fireListener() {
    if (this.eventCallback) this.eventCallback(this.min, this.max);
  }

  public addListener(callback: DSCallback) {
    this.eventCallback = callback;
  }
}