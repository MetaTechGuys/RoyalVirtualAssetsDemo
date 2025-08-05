// scripts/write-version.js
const { version } = require("../package.json");
const fs = require("fs");
fs.writeFileSync("./version.json", JSON.stringify({ version }));
