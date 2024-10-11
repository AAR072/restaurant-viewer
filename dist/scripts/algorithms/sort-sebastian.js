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
//# sourceMappingURL=sort-sebastian.js.map