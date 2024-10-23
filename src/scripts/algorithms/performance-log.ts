const DISABLE_CLEAR_CHECKBOX = document.getElementById("disable-performance-clear") as HTMLInputElement;
const CLEAR_ALL_BUTTON = document.getElementById("clear-performance-log") as HTMLButtonElement;
const TASK_CONTAINER = document.getElementById("taskContainer") as HTMLDivElement;

// use queue to store current "log elements", when checkbox is active clear
// add X button on individual performance tasks to clear them
// add clear all button
// queue timeouts as well so that they can be cleared

interface LogItem {
  count: number;
  element: HTMLDivElement;
  startTime: number,
  clearDuration: number,
  timeoutId?: number;
}

const logQueueSize: number = 20;
const logQueue: LogItem[] = new Array(logQueueSize);
let logQueueStart = 0;
let logQueueLength = 0;

const logDuration = 2000;

function getQueueIndex(count: number): number {
  return (logQueueStart + count) % logQueueSize;
}

function setTimer(item: LogItem) {
  let timeoutId

  if (DISABLE_CLEAR_CHECKBOX.checked == false) {
    item.startTime = Date.now();

    timeoutId = window.setTimeout(() => {
      clearTask();
    }, item.clearDuration);

  } else if (item.timeoutId) {
    window.clearTimeout(item.timeoutId);

    item.clearDuration = logDuration - (Date.now() - item.startTime);
  }

  item.timeoutId = timeoutId;
}

function clearTask() {
  const item = logQueue[logQueueStart];
  delete logQueue[logQueueStart];

  logQueueStart = (logQueueStart + 1) % logQueueSize;
  logQueueLength--;

  if (item) {
    item.element.remove();

    if (item.timeoutId) window.clearTimeout(item.timeoutId);
  }
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
function logTask(name: string, time: number, timestamp: number, description: string) {
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
  <p>Logged at: ${new Date(timestamp).toLocaleTimeString()}</p>
  `;

  // Append the taskDiv to the target div
  TASK_CONTAINER.appendChild(taskDiv);

  const currentTime = Date.now();

  const logItem: LogItem = {
    count: logQueueLength,
    element: taskDiv,
    startTime: currentTime,
    clearDuration: logDuration
  };

  logQueue[getQueueIndex(logQueueLength++)] = logItem;

  setTimer(logItem);
}

DISABLE_CLEAR_CHECKBOX.addEventListener("input", () => {
  for (let i = 0; i < logQueueLength; i++) {
    const item = logQueue[getQueueIndex(i)];

    setTimer(item);
  }
});

CLEAR_ALL_BUTTON.addEventListener("click", () => {
  while (logQueueLength > 0) clearTask();
});