const AUTO_CLEAR_CHECKBOX = document.getElementById("clear-performance") as HTMLInputElement;
const TASK_CONTAINER = document.getElementById("taskContainer") as HTMLDivElement;

// use queue to store current "log elements", when checkbox is active clear
// add X button on individual performance tasks to clear them
// add clear all button
// queue timeouts as well so that they can be cleared

interface LogItem {
  count: number;
  element: HTMLDivElement;
  timeout?: Timeout;
}

// Ask if queue is possible
class LogQueue<T> {
  public front: number = 0;
  public length: number = 0;
  public arr: T[];

  constructor(public size: number) {
    this.arr = new Array(size)
  }

  public getIndex(count: number) {
    return (this.front + count) % this.size;
  }

  public enqueue(item: T) {
    const index = this.getIndex(this.length++);

    this.arr[index] = item;
  }

  public dequeue() {
    const value = this.arr[this.front];

    delete this.arr[this.front];
    this.front = (this.front + 1) % this.size;
    
    return value;
  }

  public remove(count: number) {
    const value = this.arr[this.front];

    delete this.arr[this.getIndex];
  }
}

const logQueueSize: number = 20;
const logQueue: LogItem[] = new Array(logQueueSize);
let logQueueStart = 0;
let logQueueLength = 0;

function clearTask() {
  const value = logQueue[logQueueStart];
  delete logQueue[logQueueStart];

  logQueueStart = (logQueueStart + 1) % logQueueSize;

  return value;
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

  let timeoutId = window.setTimeout(() => {
    TASK_CONTAINER.innerHTML = "";
  }, 5000);

  const logItem: LogItem = {
    count: logQueueLength,
    element: taskDiv,
    timeout: timeoutId
  }

  logQueue[(logQueueStart + logQueueLength++) % logQueueSize] = logItem;

  // Remove the task after 5 seconds
}