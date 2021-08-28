const path = require('path');

const PROCESS_ENV_HOME = process.env.HOME;
const PROCESS_ENV_APPDATA = process.env.APPDATA;
const PROCESS_ENV_XDG_CONFIG_HOME = process.env.XDG_CONFIG_HOME;

function isWindows() {
  return process.env.OS === 'Windows_NT';
}

function possibleLocations() {
  let locations = [];

  locations.push(
    path.resolve(PROCESS_ENV_HOME, '.config/alacritty/alacritty.yml'),
    path.resolve(PROCESS_ENV_HOME, '.alacritty.yml')
  );

  if (isWindows()) {
    locations.push(
      path.resolve(PROCESS_ENV_APPDATA, 'alacritty/alacritty.yml')
    );
  }

  // locations where the alacritty config can be located according to
  // https://github.com/alacritty/alacritty#configuration
  if (PROCESS_ENV_XDG_CONFIG_HOME) {
    locations.concat([
      path.resolve(PROCESS_ENV_XDG_CONFIG_HOME, 'alacritty/alacritty.yml'),
      path.resolve(PROCESS_ENV_XDG_CONFIG_HOME, 'alacritty.yml'),
    ]);
  }

  return locations;
}

module.exports = {
  possibleLocations,
};
