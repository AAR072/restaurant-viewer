function insertToNumberTree<T>(tree: T [], value: T): (T | null)[] {
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

    if (value < tree[index]) {
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
