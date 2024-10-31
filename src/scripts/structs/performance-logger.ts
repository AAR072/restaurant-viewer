const DISABLE_CLEAR_CHECKBOX = document.getElementById("disable-performance-clear") as HTMLInputElement;
const CLEAR_ALL_BUTTON = document.getElementById("clear-performance-log") as HTMLButtonElement;
const TASK_CONTAINER = document.getElementById("taskContainer") as HTMLDivElement;

// use queue to store current "log elements", when checkbox is active clear
// add X button on individual performance tasks to clear them
// add clear all button
// queue timeouts as well so that they can be cleared


const LOG_QUEUE_SIZE: number = 20;
const LOG_CLEAR_INTERVAL = 2000;

const logQueue: LogItem[] = new Array(LOG_QUEUE_SIZE);
let logQueueStart = 0;
let logQueueLength = 0;

interface LogItem {
  count: number;
  element: HTMLDivElement;
}

function getQueueIndex(count: number): number {
  return (logQueueStart + count) % LOG_QUEUE_SIZE;
}

function clearTask() {
  const item = logQueue[logQueueStart];
  delete logQueue[logQueueStart];

  logQueueStart = (logQueueStart + 1) % LOG_QUEUE_SIZE;
  logQueueLength--;

  if (item) {
    item.element.style.height = item.element.offsetHeight + "px";
    item.element.classList.add("perflog-fade-out");

    window.setTimeout(() => {
      item.element.remove();
    }, LOG_CLEAR_INTERVAL);
  }
}

let clearIntervalId: number | null;

function startAutoClearTimer() {
  clearTask();

  clearIntervalId = window.setInterval(clearTask, LOG_CLEAR_INTERVAL);
}

/**
 * Logs a task and appends the task details to a specified div element on the page.
 * Each task will be removed from the DOM after 5 seconds.
 *
 * @param {string} name - The name of the task to be logged.
 * @param {number} time - The time spent on the task, in milliseconds.
 * @param {number} timestamp - The timestamp representing when the task was logged (in milliseconds since the Unix epoch).
 * @param {string} description - A brief description of the task.
 *
 * @example
 * logTask("Example Task", 5000, Date.now(), "This task involved setting up a project.", "taskContainer");
 * // This will create a new task box inside the element with id "taskContainer"
 */
function logTask(name: string, time: number, description: string) {
  const currentTime = Date.now();

  // Create a new div element to represent the task
  const taskDiv = document.createElement('div');
  taskDiv.style.border = '1px solid #444';  // Use a darker border color
  taskDiv.style.padding = '10px';
  taskDiv.style.marginBottom = '10px';
  taskDiv.style.borderRadius = '5px';
  taskDiv.style.backgroundColor = '#2e2e2e';  // Match the dark background of the theme
  taskDiv.style.color = '#fff';  // Ensure text is white for readability
  
  // Add task details inside the taskDiv
  taskDiv.innerHTML = `
  <h4 style="color: #4caf50;">${name}</h4>  <!-- Green heading to match button color -->
  <p>Time spent: ${time} milliseconds</p>
  <p>Description: ${description}</p>
  <p>Logged at: ${currentTime.toLocaleString()}</p>
  `;

  // Append the taskDiv to the target div
  TASK_CONTAINER.appendChild(taskDiv);

  const logItem: LogItem = {
    count: logQueueLength,
    element: taskDiv
  };

  while (logQueueLength >= LOG_QUEUE_SIZE - 1) {
    clearTask();
  }

  logQueue[getQueueIndex(logQueueLength++)] = logItem;

  if (!clearIntervalId) startAutoClearTimer();
}

DISABLE_CLEAR_CHECKBOX.addEventListener("input", () => {
  if (DISABLE_CLEAR_CHECKBOX.checked) {
    if (clearIntervalId) {
      window.clearInterval(clearIntervalId);

      clearIntervalId = null;
    }

  } else {
    startAutoClearTimer();
  }
});

CLEAR_ALL_BUTTON.addEventListener("click", () => {
  while (logQueueLength > 0) clearTask();
});
