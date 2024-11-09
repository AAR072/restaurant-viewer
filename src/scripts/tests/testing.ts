function outPutResults(
  div: HTMLDivElement | null,
  name: string,
  passed: boolean,
  result: string
): void {
  if (!div) return; // Check if the div is valid

  // Create a container for the test result
  const resultContainer: HTMLDivElement = document.createElement('div');
  resultContainer.className = 'test-result';

  // Create a text node for the test name and result
  const resultText: HTMLSpanElement = document.createElement('span');
  // innerHTML is bad but there is no XSS oppurtunity here :(
  resultText.innerHTML = `<h2 style="margin-bottom: 0px; color: white;">${name}</h2> <h3>${result}${
    passed ? ' ✅' : ' ❌'
  }</h3>`;
  resultText.style.color = passed ? 'green' : 'red';
  const br: HTMLBRElement = document.createElement('br');

  // Append icon and text to the result container
  resultContainer.appendChild(resultText);

  // Append the result container to the provided div
  div.appendChild(resultContainer);
  div.appendChild(br);
}

// Example button click event to test the function
function tests(div: HTMLDivElement): void {
  // clearing our div
  div.innerHTML = '';

  // Test 1: Sort and Binary Search
  let input: any = [1, 3, 4, 6, 5, 2];
  let sorted: any = sortNumbers(input);
  let expectedSortedArray: any = new Uint32Array([0, 5, 1, 2, 4, 3]);

  // Check if sorting is correct
  if (sorted.toString() !== expectedSortedArray.toString()) {
    outPutResults(
      div,
      'Sort Test',
      false,
      `Failure - Expected ${expectedSortedArray}, got ${sorted}`
    );
  } else {
    outPutResults(div, 'Sort Test', true, 'Success');
  }
  // Test Null case
  input = [];
  sorted = sortNumbers(input);
  expectedSortedArray = new Uint32Array([]);

  // Check if sorting is correct
  if (sorted.toString() !== expectedSortedArray.toString()) {
    outPutResults(
      div,
      'Null Number Sort Test',
      false,
      `Failure - Expected ${expectedSortedArray}, got ${sorted}`
    );
  } else {
    outPutResults(div, 'Null Number Sort Test', true, 'Success');
  }

  // Test 3: Sort and Binary Search
  input = ['D', 'A', 'C', 'B', 'F', 'E'];
  sorted = sortStrings(input);
  expectedSortedArray = new Uint32Array([1, 3, 2, 0, 5, 4]);

  // Check if sorting is correct
  if (sorted.toString() !== expectedSortedArray.toString()) {
    outPutResults(
      div,
      'String Sort Test',
      false,
      `Expected ${expectedSortedArray}, got ${sorted}`
    );
  } else {
    outPutResults(div, 'String Sort Test', true, 'Success');
  }

  // Test Null case
  input = [];
  sorted = sortStrings(input);
  expectedSortedArray = new Uint32Array([]);

  // Check if sorting is correct
  if (sorted.toString() !== expectedSortedArray.toString()) {
    outPutResults(
      div,
      'Null String Sort Test',
      false,
      `Expected ${expectedSortedArray}, got ${sorted}`
    );
  } else {
    outPutResults(div, 'Null String Sort Test', true, 'Success');
  }

  // Test 3: Intersection
  let firstInput: number[] = [1, 2, 3, 4];
  let secondInput: number[] = [9, 1, 4];
  let output: Uint32Array = getIntersections([firstInput, secondInput], 10);
  let expected: number[] = [1, 4];
  if (output.toString() !== expected.toString()) {
    outPutResults(
      div,
      'Interesction Test',
      false,
      `Expected ${expected}, got ${output.toString}`
    );
  } else {
    outPutResults(div, 'Intersection Test', true, 'Success');
  }
  // Test 4: No intersection
  firstInput = [1, 2, 3, 4];
  secondInput = [9, 7, 8];
  output = getIntersections([firstInput, secondInput], 10);
  expected = [];
  if (output.toString() !== expected.toString()) {
    outPutResults(
      div,
      'Null Interesction Test',
      false,
      `Expected ${expected}, got ${output.toString}`
    );
  } else {
    outPutResults(div, 'Null Intersection Test', true, 'Success');
  }

  // Test 5: Frugal Test
  let expectedString: string =
    '{"distance":64.24714107151101,"path":[{"id":0,"x":0,"y":0,"type":"START"},{"id":9,"x":8,"y":21,"type":"Japanese","index":18908},{"id":18,"x":19,"y":23,"type":"Italian","index":62423},{"id":12,"x":17,"y":17,"type":"Burger","index":73439},{"id":1,"x":5,"y":3,"type":"Pizza","index":83804},{"id":500,"x":0,"y":0,"type":"END"}],"possible":true}';
  let out: string = JSON.stringify(
    goFrugal(
      app.data.x,
      app.data.y,
      app.data.type,
      0,
      0,
      getCombinations(['Pizza', 'Burger', 'Italian', 'Japanese']),
      1,
      app.sorted.distSorted,
      0,
      0,
      false
    )
  );
  if (out === expectedString) {
    outPutResults(div, 'Go Frugal Test', true, 'Success');
  } else {
    outPutResults(
      div,
      'Go Frugal Test',
      false,
      `Expected ${expectedString}, got ${out}`
    );
  }
  // Test 6: Saving Fuel Test:
  expectedString =
    '{"distance":1009.4321554472098,"path":[{"id":0,"x":0,"y":0,"type":"START"},{"id":3,"x":11,"y":1,"type":"Coffee","index":22052},{"id":16,"x":26,"y":11,"type":"Pizza","index":40555},{"id":96,"x":61,"y":30,"type":"Chinese","index":91278},{"id":100,"x":999,"y":99,"type":"END"}]}';
  out = JSON.stringify(
    savingFuel(
      ['Pizza', 'Coffee', 'Chinese'],
      data.x,
      data.y,
      data.type,
      0,
      0,
      999,
      99,
      app.sorted.distSorted
    )
  );
  if (out === expectedString) {
    outPutResults(div, 'Saving Fuel Test', true, 'Success');
  } else {
    outPutResults(
      div,
      'Saving Fuel Test',
      false,
      `Expected ${expectedString}, got ${out}`
    );
  }
}
