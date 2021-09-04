const possibleLocations = require('./possibleLocations');

const NoAlacrittyFileFoundError = new Error(
  'No Alacritty configuration file found. Expected one of the following files to exist:\n' +
    possibleLocations().join('\n')
);

module.exports = {
  NoAlacrittyFileFoundError,
};
