const AUTO_CLEAR_CHECKBOX = document.getElementById("auto-performance-clear") as HTMLInputElement;
const CLEAR_ALL_BUTTON = document.getElementById("clear-performance-log") as HTMLButtonElement;
const PERFORMANCE_CONTAINER = document.getElementById("performance-log-container") as HTMLDivElement;

const LOG_QUEUE_SIZE: number = 30;
const LOG_TASK_DURATION = 5000;
const LOG_TASK_FADE_DURATION = 1000;

const timeouts: number[] = [];
let timeoutPointer = 0;

function clearTask(element: HTMLDivElement) {
  element.style.marginBottom = (-element.clientHeight - 10) + "px";
  element.classList.add("fade-out");

  window.setTimeout(() => {
    element.remove();
  }, LOG_TASK_FADE_DURATION);
}

function createTimeout(element: HTMLDivElement) {
  timeouts[timeoutPointer++] = window.setTimeout(() => {
    clearTask(element);

  }, LOG_TASK_DURATION);
}

/**
 * Logs a task and appends the task details to a specified div element on the page.
 * Each task will be removed from the DOM after 5 seconds.
 *
 * @param {string} name - The name of the task to be logged.
 * @param {number} time - The time spent on the task, in milliseconds.
 * @param {string} description - A brief description of the task.
 *
 * @example
 * logTask("Example Task", 5000, Date.now(), "This task involved setting up a project.", "taskContainer");
 * // This will create a new task box inside the element with id "taskContainer"
 */
function logTask(name: string, time: number, description: string) {
  const logItem = document.createElement("div");
  logItem.className = "log-task";

  const nameSpan = document.createElement("p");
  nameSpan.innerText = name;

  const timeSpan = document.createElement("p");
  timeSpan.innerText = `Task Duration: ${time.toFixed(2)}ms`;
  
  const descSpan = document.createElement("p");
  descSpan.innerText = description;

  const dateSpan = document.createElement("p");
  dateSpan.innerHTML = "Logged At: " + new Date().toLocaleTimeString(); // make it show milliseconds

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Clear";

  logItem.appendChild(nameSpan);
  logItem.appendChild(timeSpan);
  logItem.appendChild(descSpan);
  logItem.appendChild(dateSpan);
  logItem.appendChild(deleteButton);

  PERFORMANCE_CONTAINER.appendChild(logItem);

  deleteButton.addEventListener("click", () => {
    clearTask(logItem);
  });

  if (AUTO_CLEAR_CHECKBOX.checked) createTimeout(logItem);
}

AUTO_CLEAR_CHECKBOX.addEventListener("input", () => {
  if (AUTO_CLEAR_CHECKBOX.checked) {
    for (let i = 0; i < PERFORMANCE_CONTAINER.children.length; i++) {
      createTimeout(PERFORMANCE_CONTAINER.children[i] as HTMLDivElement);
    }

  } else {
    for (let i = 0; i < timeoutPointer; i++) {
      window.clearTimeout(timeouts[i]);
    }
  }
});

CLEAR_ALL_BUTTON.addEventListener("click", () => {
  for (let i = 0; i < PERFORMANCE_CONTAINER.children.length; i++) {
    clearTask(PERFORMANCE_CONTAINER.children[i] as HTMLDivElement);
  }
});