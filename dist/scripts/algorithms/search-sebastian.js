"use strict";
var Filter;
(function (Filter) {
    Filter[Filter["INVALID"] = -1] = "INVALID";
    Filter[Filter["VALID"] = 0] = "VALID";
    Filter[Filter["DOWN"] = 1] = "DOWN";
    Filter[Filter["UP"] = 2] = "UP";
})(Filter || (Filter = {}));
function search(indices, filter) {
    let low = 0;
    let high = indices.length - 1;
    while (low < high) {
        let middle = floor(low + (high - low) / 2);
        let middleIndex = indices[middle];
        let prev = middle - 1;
        let prevIndex = indices[prev];
        let middleCheck = filter(middleIndex);
        let prevCheck = filter(prevIndex);
        if (middleCheck == Filter.VALID) {
            // const results = searchScan(indices, middle, low, high, filter)
            return middleIndex;
        }
        else if (middleCheck == Filter.UP) {
            low = middle + 1;
            high = high;
        }
        else if (middleCheck == Filter.DOWN) {
            low = low;
            high = middle;
        }
        else {
            break;
        }
    }
}
// Testing
// let input = "aa";
// let results = search<number>(sorted, (a: number) => {
//   const value = data.storeName[a];
//   const matched = value.substring(0, input.length);
//   if (matched.toLowerCase() == input.toLowerCase()) return Filter.VALID;
//   else {
//     const comparison = value.localeCompare(input);
//     if (comparison > 0) return Filter.UP;
//     if (comparison < 0) return Filter.DOWN;
//     else return Filter.INVALID;
//   }
// });
//# sourceMappingURL=search-sebastian.js.map