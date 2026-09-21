const path = require("node:path");

module.exports = function extension(filePath) {
  return path.extname(filePath);
};
