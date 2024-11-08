// #region HTML elements
const AUTO_CLEAR_CHECKBOX = document.getElementById("auto-performance-clear") as HTMLInputElement;
const CLEAR_ALL_BUTTON = document.getElementById("clear-performance-log") as HTMLButtonElement;
const PERFORMANCE_CONTAINER = document.getElementById("performance-log-container") as HTMLDivElement;
// #endregion

const LOG_TASK_DURATION = 5000; // Amount of time before a log task is removed.
const LOG_TASK_FADE_DURATION = 1000; // The duration of the log task fade animation

const timeouts: number[] = [];
let timeoutPointer = 0;

/**
 * Fades out and eventually removes the specified task element.
 * @param element The task element to be removed.
 * @timecomplexity O(1)
 */
function clearTask(element: HTMLDivElement) {
  element.style.marginBottom = (-element.clientHeight - 10) + "px";
  element.classList.add("fade-out");

  window.setTimeout(() => {
    element.remove();
  }, LOG_TASK_FADE_DURATION);
}

/**
 * Applies a timer for the removal of a log task element.
 * @param element The element in which the timer is applied.
 * @timecomplexity O(1)
 */
function createTimeout(element: HTMLDivElement) {
  timeouts[timeoutPointer++] = window.setTimeout(() => {
    clearTask(element);

  }, LOG_TASK_DURATION);
}

/**
 * Logs a task and appends the task details the log container div.
 * @param name The name of the task to be logged.
 * @param time The time spent on the task, in milliseconds.
 * @param description A brief description of the task.
 * @timecomplexity O(1)
 * @example
 * logTask("Example Task", 5000, "This task involved setting up a project.");
 */
function logTask(name: string, time: number, description: string) {
  const logItem = document.createElement("div");
  logItem.className = "log-task";

  const nameSpan = document.createElement("p");
  nameSpan.className = "task-title";
  nameSpan.innerText = name;

  const descSpan = document.createElement("p");
  descSpan.innerText = description;

  const timeSpan = document.createElement("p");
  timeSpan.innerHTML = `<bold>Task Duration:<bold> ${time.toFixed(2)}ms`;

  const dateSpan = document.createElement("p");
  dateSpan.innerHTML = "<bold>Logged At:<bold> " + new Date().toLocaleTimeString(); // make it show milliseconds

  const deleteButton = document.createElement("button");
  deleteButton.className = "log-clear";
  deleteButton.innerText = "Clear";

  logItem.appendChild(nameSpan);
  logItem.appendChild(descSpan);
  logItem.appendChild(timeSpan);
  logItem.appendChild(dateSpan);
  logItem.appendChild(deleteButton);

  PERFORMANCE_CONTAINER.appendChild(logItem);

  deleteButton.addEventListener("click", () => {
    clearTask(logItem);
  });

  if (AUTO_CLEAR_CHECKBOX.checked) createTimeout(logItem);
}

AUTO_CLEAR_CHECKBOX.addEventListener("input", () => {
  if (AUTO_CLEAR_CHECKBOX.checked) { // Creates timeouts for all log tasks if checked
    for (let i = 0; i < PERFORMANCE_CONTAINER.children.length; i++) {
      createTimeout(PERFORMANCE_CONTAINER.children[i] as HTMLDivElement);
    }

  } else { // Clears all timeouts and empties timeout array when unchecked
    for (let i = 0; i < timeoutPointer; i++) {
      window.clearTimeout(timeouts[i]);
    }

    timeoutPointer = 0;
    timeouts.length = 0;
  }
});

CLEAR_ALL_BUTTON.addEventListener("click", () => {
  // Clears all log tasks inside of the container
  for (let i = 0; i < PERFORMANCE_CONTAINER.children.length; i++) {
    clearTask(PERFORMANCE_CONTAINER.children[i] as HTMLDivElement);
  }
});