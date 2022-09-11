#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

const {
  createBackup,
  helpMessage,
  existingTheme,
  themesFolder,
} = require('../src/helpers');

const { applyTheme, createConfigFile, getCurrentTheme } = require('../index');

let themesFolderPath = themesFolder();
let themes = fs.readdirSync(themesFolderPath).map((f) => f.replace('.yml', ''));

function main() {
  createBackup();
  const command = process.argv[2];

  if (existingTheme(command, themesFolderPath)) {
    return applyTheme(command, themesFolderPath);
  }

  if (['--directory', '-d'].includes(command)) {
    if (process.argv[3] === undefined) {
      return console.log('themes folder is required');
    }

    themesFolderPath = path.resolve(process.argv[3]);
    themes = fs.readdirSync(themesFolderPath).map((f) => f.replace('.yml', ''));
  }

  if (['--help', '-h'].includes(command)) {
    return console.log(helpMessage());
  }

  if (['--create', '-C'].includes(command)) {
    return createConfigFile();
  }

  if (['--current', '-c'].includes(command)) {
    return console.log(getCurrentTheme());
  }

  if (['--list', '-l'].includes(command)) {
    return themes.map((theme, index) => {
      console.log(index, theme);
    });
  }

  (async () => {
    const response = await prompts({
      type: 'autocomplete',
      name: 'theme',
      message: 'Select a theme',
      choices: themes.map((t) => {
        return {
          title: t,
          value: t,
        };
      }),
      onState: (state) => {
        state.value && applyTheme(state.value, themesFolderPath, true); // set preview true
      },
    });

    try {
      if (response.theme) {
        applyTheme(response.theme, themesFolderPath);
      }
    } catch (e) {
      console.log('Something went wrong', e);
    }
  })();
}

main();
