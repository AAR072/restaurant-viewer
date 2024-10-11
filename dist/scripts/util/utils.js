"use strict";
function floor(n) {
    return n - n % 1;
}
function slice(arr, start, end) {
    if (end === undefined) {
        end = arr.length;
    }
    let outPut = [];
    for (let i = start; i < end; i++) {
        outPut.push(arr[i]);
    }
    return outPut;
}
function getMax(a, b) {
    return a < b ? b : a;
}
function getMin(a, b) {
    return a > b ? b : a;
}
//# sourceMappingURL=utils.js.map