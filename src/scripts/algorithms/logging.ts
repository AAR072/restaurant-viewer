/**
 * Logs a task and appends the task details to a specified div element on the page.
 * Each task will be removed from the DOM after 5 seconds.
 *
 * @param {string} name - The name of the task to be logged.
 * @param {number} time - The time spent on the task, in milliseconds.
 * @param {number} timestamp - The timestamp representing when the task was logged (in milliseconds since the Unix epoch).
 * @param {string} description - A brief description of the task.
 * @param {string} divId - The ID of the div element where the task information should be appended.
 *
 * @example
 * logTask("Example Task", 5000, Date.now(), "This task involved setting up a project.", "taskContainer");
 * // This will create a new task box inside the element with id "taskContainer"
 */
function logTask(name: string, time: number, timestamp: number, description: string, divId: string) {
    const checkbox = document.getElementById("clear-performance") as HTMLInputElement;
    // Find the target div using the divId
    const targetDiv = document.getElementById(divId);

    if (!targetDiv) {
        console.error(`Div with id ${divId} not found.`);
        return;
    }

    // Create a new div element to represent the task
    const taskDiv = document.createElement('div');
    taskDiv.style.border = '1px solid #444';  // Use a darker border color
    taskDiv.style.padding = '10px';
    taskDiv.style.marginBottom = '10px';
    taskDiv.style.borderRadius = '5px';
    taskDiv.style.backgroundColor = '#2e2e2e';  // Match the dark background of the theme
    taskDiv.style.color = '#fff';  // Ensure text is white for readability

    // Format the timestamp (optional, to make it more readable)
    const date = new Date(timestamp);
    const formattedTimestamp = date.toLocaleString();

    // Add task details inside the taskDiv
    taskDiv.innerHTML = `
        <h4 style="color: #4caf50;">${name}</h4>  <!-- Green heading to match button color -->
        <p>Time spent: ${time} milliseconds</p>
        <p>Description: ${description}</p>
        <p>Logged at: ${formattedTimestamp}</p>
    `;

    // Append the taskDiv to the target div
    targetDiv.appendChild(taskDiv);

    // Remove the task after 5 seconds
    if (checkbox.checked) {
    setTimeout(() => {
        targetDiv.innerHTML = "";
    }, 5000);
  }
}
