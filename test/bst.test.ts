import { data } from "../src/index";
import {insertToNumberTree} from "../src/scripts/structs/bst"
let root: number [] = [];
test("Ensure X values work", () => {
  insertToNumberTree(root, data.x[0]);
  insertToNumberTree(root, data.x[2]);
  expect(insertToNumberTree(root, data.x[44])).toEqual(root);
});
