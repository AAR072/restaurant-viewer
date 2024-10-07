"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_search_1 = require("./scripts/algorithms/store-search");
//TEMP CODE FOR TESTING 
const fs_1 = require("fs");
// Load JSON text from server hosted file and return JSON parsed object
function loadJSON(filePath) {
    // Load json file;
    const json = (0, fs_1.readFileSync)(filePath, 'utf8');
    if (json) {
        // Parse json
        return JSON.parse(json);
    }
    return null;
}
const data = loadJSON("../DO_NOT_TOUCH/data.json"); //Don't delete this line. All your data is here. It does take a few seconds for Replit to load the data because it's so large.
console.log((0, store_search_1.storeSearch)(data, undefined, undefined, undefined, undefined, undefined, [1, 3], undefined));
//# sourceMappingURL=index.js.map