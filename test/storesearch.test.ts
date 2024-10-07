import { data } from "../src";
import {storeSearch} from "../src/scripts/algorithms/store-search"
test("ID", () => {
  //expect(middleOfThree(100, 200, 150)).toBe(150);
  expect(storeSearch(data, "9ea6b46d24e1e", undefined, undefined, undefined, undefined, undefined, undefined)).toEqual({
  ID: [ '9ea6b46d24e1e' ],
  storeName: [ 'and Eatery Luna' ],
  type: [ 'Pizza' ],
  cost: [ 13.16 ],
  review: [ 1 ],
  x: [ 1310 ],
  y: [ 1954 ]
}
)
});
