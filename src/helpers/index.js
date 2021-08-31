const possibleLocations = require('./possibleLocations');
const {
  alacrittyFileExists,
  alacrittyConfigPath,
} = require('./existingAlacrittyFile');

const { NoAlacrittyFileFoundError } = require('./alacrittyThemesErrors');

module.exports = {
  possibleLocations,
  alacrittyFileExists,
  alacrittyConfigPath,
  NoAlacrittyFileFoundError,
};
