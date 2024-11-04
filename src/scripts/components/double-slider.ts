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
  public minText: HTMLInputElement;
  public maxText: HTMLInputElement;
  public eventCallback: DSCallback;

  constructor(
    public element: HTMLDivElement,
    public rangeMin: number,
    public rangeMax: number,
    public decimals: number
  ) {
    const progress = element.querySelector(".progress") as HTMLDivElement;
    const minSlider = element.querySelector(".min-range") as HTMLInputElement;
    const maxSlider = element.querySelector(".max-range") as HTMLInputElement;
    const minTextDisplay = element.querySelector(".slider-min-text") as HTMLSpanElement;
    const maxTextDisplay = element.querySelector(".slider-max-text") as HTMLSpanElement;
    const minText = element.querySelector(".slider-min-input") as HTMLInputElement;
    const maxText = element.querySelector(".slider-max-input") as HTMLInputElement;

    this.interval = 10**-decimals;

    minSlider.min = maxSlider.min = rangeMin.toString();
    minSlider.max = maxSlider.max = rangeMax.toString();
    minSlider.step = maxSlider.step = this.interval.toString();

    this.progress = progress;
    this.minSlider = minSlider;
    this.maxSlider = maxSlider;
    this.minTextDisplay = minTextDisplay;
    this.maxTextDisplay = maxTextDisplay;
    this.minText = minText;
    this.maxText = maxText;

    minSlider.addEventListener("input", () => {
      this.updateSlider(parseFloat(minSlider.value), parseFloat(maxSlider.value), true);
    });

    maxSlider.addEventListener("input", () => {
      this.updateSlider(parseFloat(minSlider.value), parseFloat(maxSlider.value), false);
    });

    minSlider.addEventListener("mouseup", () => {
      console.log("TEST");
      this.fireListener();
    });

    maxSlider.addEventListener("mouseup", () => {
      this.fireListener();
    })

    minText.addEventListener("keypress", (event: KeyboardEvent) => {
      if (event.key != "Enter") return;

      this.updateSlider(parseFloat(minText.value), parseFloat(maxText.value), true);
      this.fireListener();
    });

    minText.addEventListener("blur", () => {
      this.updateSlider(parseFloat(minText.value), parseFloat(maxText.value), true);
      this.fireListener();
    });

    maxText.addEventListener("keypress", (event: KeyboardEvent) => {
      if (event.key != "Enter") return;

      this.updateSlider(parseFloat(minText.value), parseFloat(maxText.value), false);
      this.fireListener();
    });

    maxText.addEventListener("blur", () => {
      this.updateSlider(parseFloat(minText.value), parseFloat(maxText.value), false);
      this.fireListener();
    });

    this.updateSlider(this.rangeMin, this.rangeMax, false);
  }

  private updateSlider(minVal: number, maxVal: number, min: boolean) {
    if (isNaN(minVal)) minVal = this.min;
    if (isNaN(maxVal)) maxVal = this.max;

    if (min) minVal = getMin(minVal, maxVal - this.interval);
    else maxVal = getMax(maxVal, minVal + this.interval);

    minVal = clamp(minVal, this.rangeMin, this.rangeMax);
    maxVal = clamp(maxVal, this.rangeMin, this.rangeMax);

    this.min = minVal;
    this.max = maxVal;

    const pctLeft = (minVal/this.rangeMax)*100;
    const pctRight = (1 - maxVal/this.rangeMax)*100;

    this.minSlider.value = this.minText.value = minVal.toFixed(this.decimals).toString();
    this.maxSlider.value = this.maxText.value = maxVal.toFixed(this.decimals).toString();

    this.progress.style.left = pctLeft + "%";
    this.progress.style.right = pctRight + "%";

    this.minTextDisplay.style.left = pctLeft + "%";
    this.maxTextDisplay.style.right = pctRight + "%";

    this.minText.style.width = (this.minText.value.length*8) + "px";
    this.maxText.style.width = (this.maxText.value.length*8) + "px";
  }

  private fireListener() {
    if (this.eventCallback) this.eventCallback(this.min, this.max);
  }

  public addListener(callback: DSCallback) {
    this.eventCallback = callback;
  }
}