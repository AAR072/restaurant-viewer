// #region HTML elements
const AUTO_CLEAR_CHECKBOX: HTMLInputElement = document.getElementById(
  'auto-performance-clear'
) as HTMLInputElement;
const CLEAR_ALL_BUTTON: HTMLButtonElement = document.getElementById(
  'clear-performance-log'
) as HTMLButtonElement;
const PERFORMANCE_CONTAINER: HTMLDivElement = document.getElementById(
  'performance-log-container'
) as HTMLDivElement;
// #endregion

const LOG_TASK_DURATION: number = 5000; // Amount of time before a log task is removed.
const LOG_TASK_FADE_DURATION: number = 1000; // The duration of the log task fade animation

const timeouts: number[] = [];
let timeoutPointer: number = 0;

/**
 * Fades out and eventually removes the specified task element.
 * @param element The task element to be removed.
 * @timecomplexity O(1)
 */
function clearTask(element: HTMLDivElement): void {
  element.style.marginBottom = -element.clientHeight - 10 + 'px';
  element.classList.add('fade-out');

  window.setTimeout(() => {
    element.remove();
  }, LOG_TASK_FADE_DURATION);
}

/**
 * Applies a timer for the removal of a log task element.
 * @param element The element in which the timer is applied.
 * @timecomplexity O(1)
 */
function createTimeout(element: HTMLDivElement): void {
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
function logTask(name: string, time: number, description: string): void {
  const logItem: HTMLDivElement = document.createElement('div');
  logItem.className = 'log-task';

  const nameSpan: HTMLDivElement = document.createElement('p');
  nameSpan.className = 'task-title';
  nameSpan.innerText = name;

  const descSpan: HTMLDivElement = document.createElement('p');
  descSpan.innerText = description;

  const timeSpan: HTMLParagraphElement = document.createElement('p');
  timeSpan.innerHTML = `<bold>Task Duration:<bold> ${time.toFixed(2)}ms`;

  const dateSpan: HTMLParagraphElement = document.createElement('p');
  dateSpan.innerHTML =
    '<bold>Logged At:<bold> ' + new Date().toLocaleTimeString(); // make it show milliseconds

  const deleteButton: HTMLButtonElement = document.createElement('button');
  deleteButton.className = 'log-clear';
  deleteButton.innerText = 'Clear';

  logItem.appendChild(nameSpan);
  logItem.appendChild(descSpan);
  logItem.appendChild(timeSpan);
  logItem.appendChild(dateSpan);
  logItem.appendChild(deleteButton);

  PERFORMANCE_CONTAINER.appendChild(logItem);

  deleteButton.addEventListener('click', () => {
    clearTask(logItem);
  });

  if (AUTO_CLEAR_CHECKBOX.checked) createTimeout(logItem);
}

AUTO_CLEAR_CHECKBOX.addEventListener('input', () => {
  if (AUTO_CLEAR_CHECKBOX.checked) {
    // Creates timeouts for all log tasks if checked
    for (let i: number = 0; i < PERFORMANCE_CONTAINER.children.length; i++) {
      createTimeout(PERFORMANCE_CONTAINER.children[i] as HTMLDivElement);
    }
  } else {
    // Clears all timeouts and empties timeout array when unchecked
    for (let i: number = 0; i < timeoutPointer; i++) {
      window.clearTimeout(timeouts[i]);
    }

    timeoutPointer = 0;
    timeouts.length = 0;
  }
});

CLEAR_ALL_BUTTON.addEventListener('click', () => {
  // Clears all log tasks inside of the container
  for (let i: number = 0; i < PERFORMANCE_CONTAINER.children.length; i++) {
    clearTask(PERFORMANCE_CONTAINER.children[i] as HTMLDivElement);
  }
});
