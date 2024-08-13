#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const Fuse = require('fuse.js');

const { createBackup, helpMessage, themesFolder } = require('../src/helpers');
const { applyTheme, createConfigFile, getCurrentTheme } = require('../index');

let themesFolderPath = themesFolder();
let themes = fs
  .readdirSync(themesFolderPath)
  .map((f) => f.replace('.toml', ''));

function main() {
  const command = process.argv[2];

  if (['--directory', '-d'].includes(command)) {
    if (process.argv[3] === undefined) {
      return console.log('themes folder is required');
    }

    themesFolderPath = path.resolve(process.argv[3]);
    themes = fs
      .readdirSync(themesFolderPath)
      .map((f) => f.replace('.toml', ''));
  }

  const fuse_instance = new Fuse(themes, {
    keys: ['title'],
    threshold: 0.5,
  });

  if (['--help', '-h'].includes(command)) {
    return console.log(helpMessage());
  }

  if (['--create', '-C'].includes(command)) {
    return createConfigFile();
  }

  if (['--current', '-c'].includes(command)) {
    return console.log(getCurrentTheme(themesFolderPath));
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
      suggest: (input, choices) => {
        if (input.length === 0) return choices;
        const fuzzy_results = fuse_instance.search(input);
        return fuzzy_results.map((result) => result.item);
      },
    });

    try {
      if (response.theme) {
        createBackup();
        applyTheme(response.theme, themesFolderPath);
      }
    } catch (e) {
      console.log('Something went wrong', e);
    }
  })();
}

main();
