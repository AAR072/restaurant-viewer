"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.floor = floor;
exports.slice = slice;
exports.getMax = getMax;
exports.getMin = getMin;
function floor(val) {
    if ((val * 10) % 10 === 5) {
        return val - 0.5;
    }
    return val;
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