function outPutResults(div: HTMLDivElement | null, name: string, passed: boolean, result: string) {
  if (!div) return; // Check if the div is valid

  // Create a container for the test result
  const resultContainer = document.createElement("div");
  resultContainer.className = "test-result";

  // Create the icon for pass/fail
  const icon = document.createElement("span");
  icon.innerHTML = passed ? "✅" : "❌"; // Green check or red X
  icon.style.color = passed ? "green" : "red";
  icon.style.marginRight = "5px";

  // Create a text node for the test name and result
  const resultText = document.createElement("span");
  resultText.textContent = `${name}: ${result}`;

  // Append icon and text to the result container
  resultContainer.appendChild(icon);
  resultContainer.appendChild(resultText);

  // Append the result container to the provided div
  div.appendChild(resultContainer);
}

// Example button click event to test the function
function tests(div: HTMLDivElement | null) {
  // Test 1: Sort and Binary Search
  let input:any = [1, 3, 4, 6, 5, 2];
  let sorted:any = sortNumbers(input);
  let expectedSortedArray: any = new Uint32Array([0, 5, 1, 2, 4, 3]);

  // Check if sorting is correct
  if (sorted.toString() !== expectedSortedArray.toString()) {
    outPutResults(div, "Sort Test", false, `Failure - Expected ${expectedSortedArray}, got ${sorted}`);
  } else {
    outPutResults(div, "Sort Test", true, "Success");
  }
  // Test Null case
  input = [];
  sorted= sortNumbers(input);
  expectedSortedArray= new Uint32Array([]);

  // Check if sorting is correct
  if (sorted.toString() !== expectedSortedArray.toString()) {
    outPutResults(div, "Null Number Sort Test", false, `Failure - Expected ${expectedSortedArray}, got ${sorted}`);
  } else {
    outPutResults(div, "Null Number Sort Test", true, "Success");
  }

  // Test 3: Sort and Binary Search
  input = ["D", "A", "C", "B", "F", "E"]
  sorted = sortStrings(input);
  expectedSortedArray = new Uint32Array([1, 3, 2, 0, 5, 4]);

  // Check if sorting is correct
  if (sorted.toString() !== expectedSortedArray.toString()) {
    outPutResults(div, "String Sort Test", false, `Expected ${expectedSortedArray}, got ${sorted}`);
  } else {
    outPutResults(div, "String Sort Test", true, "Success");
  }
  
  // Test Null case
  input = [];
  sorted = sortStrings(input);
  expectedSortedArray = new Uint32Array([]);

  // Check if sorting is correct
  if (sorted.toString() !== expectedSortedArray.toString()) {
    outPutResults(div, "Null String Sort Test", false, `Expected ${expectedSortedArray}, got ${sorted}`);
  } else {
    outPutResults(div, "Null String Sort Test", true, "Success");
  }

  // Test 3: Intersection
  let firstInput = [1, 2, 3, 4];
  let secondInput = [9, 1, 4];
  let output = getIntersections([firstInput, secondInput], 10);
  let expected = [1,4];
  if (output.toString() !== expected.toString()) {
    outPutResults(div, "Interesction Test", false, `Expected ${expectedSortedArray}, got ${sorted}`);
  } else {
    outPutResults(div, "Intersection Test", true, "Success");
  }
  firstInput = [1, 2, 3, 4];
  secondInput = [9, 7, 8];
  output = getIntersections([firstInput, secondInput], 10);
  expected = [];
  if (output.toString() !== expected.toString()) {
    outPutResults(div, "Interesction Test", false, `Expected ${expectedSortedArray}, got ${sorted}`);
  } else {
    outPutResults(div, "Intersection Test", true, "Success");
  }



}
tests(null);
