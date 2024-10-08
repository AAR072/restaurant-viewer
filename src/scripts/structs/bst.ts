// GARBAGE CODE: DELETE ME LATER

function insertToNumberTree (tree: number[], value: number, i:number, currentNode = 0): (number| null)[] {
  if (tree[currentNode] != undefined){
    if (value <= tree[currentNode]) {

    }
  } else {
    tree[currentNode] = value;
  }
  return tree;
}

// function insertToNumberTree (tree: number[], value: number, currentNode = 0): (number| null)[] {
//   const newNode = value;
//   let index = 0;
//   let length = tree.length;
//   if(tree[0] === undefined){
//     tree[0] = value; 
//   }
//   else { 
//     for (let index = 0; index < tree.length; index++) { 
//     if (value < tree[index]) {
//       index = 2 * index + 1; // Move to the left child
//       tree[index] = newNode;
//       break;
//     } else if (value > tree[index]) {
//       index = 2 * index + 2; // Move to the right child
//       tree[index] = newNode;
//       break;
//     } 
//   }

//   }

//   return tree;
// }

function insertToStringTree(tree: string [], value: string): (string | null)[] {
  const newNode = value;
  let index = 0;
  let length = tree.length;

  while (true) {
    if (index >= length) {
      tree[length] = newNode; // Extend the array if needed
      break;
    }
    if (tree[index] === null) {
      tree[index] = newNode; // Insert at the first null spot
      break;
    }
    // temp compare (fix this later)
    if (value.localeCompare(tree[index])) {
      index = 2 * index + 1; // Move to the left child
    } else if (value > tree[index]) {
      index = 2 * index + 2; // Move to the right child
    } else {
      break; // If the value already exists, do not insert it again
    }
  }

  return tree;
}
export {insertToNumberTree} 
