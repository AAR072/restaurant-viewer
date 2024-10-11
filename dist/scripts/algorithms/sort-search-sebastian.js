"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortNumbers = sortNumbers;
exports.sortStrings = sortStrings;
var Compare;
(function (Compare) {
    Compare[Compare["LESS"] = -1] = "LESS";
    Compare[Compare["EQUAL"] = 0] = "EQUAL";
    Compare[Compare["MORE"] = 1] = "MORE";
})(Compare || (Compare = {}));
var Filter;
(function (Filter) {
    Filter[Filter["INVALID"] = -1] = "INVALID";
    Filter[Filter["VALID"] = 0] = "VALID";
    Filter[Filter["DOWN"] = 1] = "DOWN";
    Filter[Filter["UP"] = 2] = "UP";
})(Filter || (Filter = {}));
function floor(n) {
    return n - n % 1;
}
// Sorting
function merge(arr, low, mid, high, compare) {
    const leftLength = mid - low + 1;
    const rightLength = high - mid;
    const length = high - low + 1;
    const left = new Array(leftLength);
    const right = new Array(rightLength);
    for (let i = 0; i < leftLength; i++)
        left[i] = arr[low + i];
    for (let i = 0; i < rightLength; i++)
        right[i] = arr[mid + 1 + i];
    let leftPoint = 0;
    let rightPoint = 0;
    let pointer = 0;
    while (pointer < length) {
        if (rightPoint >= rightLength || (leftPoint < leftLength && compare(left[leftPoint], right[rightPoint]) == Compare.LESS)) {
            // fix and understand this ^^^
            arr[low + pointer] = left[leftPoint];
            leftPoint++;
        }
        else {
            arr[low + pointer] = right[rightPoint];
            rightPoint++;
        }
        pointer++;
    }
}
function sort(sorted, left, right, compare) {
    if (left >= right) {
        sorted[right] = right;
        return;
    }
    const middle = floor(left + (right - left) / 2);
    sort(sorted, left, middle, compare);
    sort(sorted, middle + 1, right, compare);
    merge(sorted, left, middle, right, compare);
}
function sortArray(arr, compare) {
    const length = arr.length;
    const sorted = new Array(length);
    sort(sorted, 0, length - 1, compare);
    return sorted;
}
function sortNumbers(arr) {
    return sortArray(arr, (a, b) => {
        const aVal = arr[a];
        const bVal = arr[b];
        if (aVal > bVal)
            return Compare.MORE;
        else if (aVal < bVal)
            return Compare.LESS;
        else
            return Compare.EQUAL;
    });
}
function sortStrings(arr) {
    return sortArray(arr, (a, b) => {
        const difference = arr[a].localeCompare(arr[b]);
        if (difference > 0)
            return Compare.MORE;
        else if (difference < 0)
            return Compare.LESS;
        else
            return Compare.EQUAL;
    });
}
// Searching
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
//# sourceMappingURL=sort-search-sebastian.js.map