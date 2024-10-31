// Code foor testing bonuses DO NOT DELETE

// let a = performance.now();
// const uniqueCombinations = getCombinations(cuisines);
// console.log(performance.now() - a);
// console.log(uniqueCombinations);

// const [sortedX, sortedY, sortedTypes] = sortPointsWithTypes(data.x, data.y, data.type, [86,83]);
// let t1, t0, result;
// let TNodes:  TNode[] = [];

// for (let i = 0; i < 100; i++) {
//   TNodes.push({id: i, x: sortedX[i], y:sortedY[i], type: sortedTypes[i]});
// }
// let graph: Graph = {
//   TNodes,
//   categories: ["Pizza", "Burger", "Mexican", "Indian"],
// };

// let maxResult = {distance: Infinity};
// t0 = performance.now();
// for (let i = 0; i < uniqueCombinations.length; i++) {
//   graph = {TNodes, categories: uniqueCombinations[i]}
//   let result = findMinimumDistanceAnywhere(graph, 0); 
//   if (result.distance < maxResult.distance) {
//     maxResult = result; 
//   }
// }
// console.log(performance.now() - t0);
// console.log(maxResult);



// t0 = performance.now();
// result = findMinimumDistanceToTypesAndEnd(graph, 0, 0);
// t1 = performance.now();
// console.log("Minimum distance:", result.distance);
// console.log("Path taken:");
// result.path.forEach(TNode => {
//   console.log(`TNode ID: ${TNode.id}, Type: ${TNode.type}, Coordinates: (${TNode.x}, ${TNode.y})`);
// });
// console.log(`With end 100 ${t1 - t0}`);

// t0 = performance.now();
// result = findMinimumDistanceAnywhere(graph, 0);
// t1 = performance.now();
// console.log("Minimum distance:", result.distance);
// console.log("Path taken:");
// result.path.forEach(TNode => {
//   console.log(`TNode ID: ${TNode.id}, Type: ${TNode.type}, Coordinates: (${TNode.x}, ${TNode.y})`);
// });
// console.log(`With no end 100 ${t1 - t0}`);



// TNodes  = [];

// for (let i = 0; i < 500; i++) {
//   TNodes.push({id: i, x: sortedX[i], y:sortedY[i], type: sortedTypes[i]});
// }
// graph = {
//   TNodes,
//   categories: ["Pizza", "Burger", "Mexican", "Indian"],
// };


// t0 = performance.now();
// result = findMinimumDistanceToTypesAndEnd(graph, 0, 0);
// t1 = performance.now();
// console.log("Minimum distance:", result.distance);
// console.log("Path taken:");
// result.path.forEach(TNode => {
//   console.log(`TNode ID: ${TNode.id}, Type: ${TNode.type}, Coordinates: (${TNode.x}, ${TNode.y})`);
// });
// console.log(`With end 500 ${t1 - t0}`);

// t0 = performance.now();
// result = findMinimumDistanceAnywhere(graph, 0);
// t1 = performance.now();
// console.log("Minimum distance:", result.distance);
// console.log("Path taken:");
// result.path.forEach(TNode => {
//   console.log(`TNode ID: ${TNode.id}, Type: ${TNode.type}, Coordinates: (${TNode.x}, ${TNode.y})`);
// });
// console.log(`With no end 500 ${t1 - t0}`);

// TNodes  = [];

// for (let i = 0; i < 1000; i++) {
//   TNodes.push({id: i, x: sortedX[i], y:sortedY[i], type: sortedTypes[i]});
// }
// graph = {
//   TNodes,
//   categories: ["Pizza", "Burger", "Mexican", "Indian"],
// };


// t0 = performance.now();
// result = findMinimumDistanceToTypesAndEnd(graph, 0, 0);
// t1 = performance.now();
// console.log("Minimum distance:", result.distance);
// console.log("Path taken:");
// result.path.forEach(TNode => {
//   console.log(`TNode ID: ${TNode.id}, Type: ${TNode.type}, Coordinates: (${TNode.x}, ${TNode.y})`);
// });
// console.log(`With end 1k ${t1 - t0}`);

// t0 = performance.now();
// result = findMinimumDistanceAnywhere(graph, 0);
// t1 = performance.now();
// console.log("Minimum distance:", result.distance);
// console.log("Path taken:");
// result.path.forEach(TNode => {
//   console.log(`TNode ID: ${TNode.id}, Type: ${TNode.type}, Coordinates: (${TNode.x}, ${TNode.y})`);
// });
// console.log(`With no end 1k ${t1 - t0}`);




// TNodes  = [];

// for (let i = 0; i < 2000; i++) {
//   TNodes.push({id: i, x: sortedX[i], y:sortedY[i], type: sortedTypes[i]});
// }
// graph = {
//   TNodes,
//   categories: ["Pizza", "Burger", "Mexican", "Indian"],
// };


// t0 = performance.now();
// result = findMinimumDistanceToTypesAndEnd(graph, 0, 0);
// t1 = performance.now();
// console.log("Minimum distance:", result.distance);
// console.log("Path taken:");
// result.path.forEach(TNode => {
//   console.log(`TNode ID: ${TNode.id}, Type: ${TNode.type}, Coordinates: (${TNode.x}, ${TNode.y})`);
// });
// console.log(`With end 2k ${t1 - t0}`);

// t0 = performance.now();
// result = findMinimumDistanceAnywhere(graph, 0);
// t1 = performance.now();
// console.log("Minimum distance:", result.distance);
// console.log("Path taken:");
// result.path.forEach(TNode => {
//   console.log(`TNode ID: ${TNode.id}, Type: ${TNode.type}, Coordinates: (${TNode.x}, ${TNode.y})`);
// });
// console.log(`With no end 2k ${t1 - t0}`);

