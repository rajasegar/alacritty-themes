const possibleLocations = require('./possibleLocations');
const fs = require('fs');

function alacrittyFileExists() {
  return possibleLocations().some(function (location) {
    return fs.existsSync(location);
  });
}

function alacrittyConfigPath() {
  return possibleLocations().find(function (location) {
    if (!fs.existsSync(location)) return;

    return location;
  });
}

module.exports = {
  alacrittyFileExists,
  alacrittyConfigPath,
};
