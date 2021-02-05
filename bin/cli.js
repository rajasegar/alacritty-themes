#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const prompts = require('prompts');

const { applyTheme, getPrevTheme,restoreColors  } = require("../index");

const themesDir = path.join(__dirname, "..", "themes/");
const themes = fs.readdirSync(themesDir).map((f) => f.replace(".yml", ""));



function main() {
  const oldColors  = getPrevTheme();

  (async () => {
    const response = await prompts({
      type: 'autocomplete',
      name: 'theme',
      message: 'Select a theme',
      choices: themes.map(t => {
        return {
          title: t,
          value: t
        };
      }),
      onState: (state) => {
        applyTheme(state.value, true); // set preview true
      }
    });

    if(response.theme) {
      applyTheme(response.theme);
    } else {
      // User cancelled the selection, so restore to old colors
      restoreColors(oldColors);
    }

  })();
}

main();
