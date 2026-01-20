#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const { execSync } = require('child_process');

const {
  createBackup,
  helpMessage,
  existingTheme,
  themesFolder,
} = require('../src/helpers');

const { applyTheme, applyFontSize, applyFontFamily, applyOpacity, createConfigFile, getCurrentTheme, getCurrentFont, getCurrentOpacity } = require('../index');

function getSystemFonts(monoOnly = false) {
  try {
    const cmd = monoOnly
      ? 'fc-list :spacing=mono family | sort -u'
      : 'fc-list : family | sort -u';
    const output = execSync(cmd, { encoding: 'utf8' });
    return output
      .split('\n')
      .map(f => f.split(',')[0].trim())
      .filter(f => f.length > 0)
      .filter((v, i, a) => a.indexOf(v) === i); // unique
  } catch (e) {
    console.log('Could not get system fonts. Is fontconfig installed?');
    return [];
  }
}

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

  if (['--size', '-s'].includes(command)) {
    const size = parseInt(process.argv[3], 10);
    if (isNaN(size) || size < 1 || size > 100) {
      return console.log('Please provide a valid font size (1-100)');
    }
    return applyFontSize(size);
  }

  if (['--font', '-f'].includes(command)) {
    const family = process.argv[3];
    if (!family) {
      return console.log('Please provide a font family name');
    }
    return applyFontFamily(family);
  }

  if (['--font-info', '-F'].includes(command)) {
    const font = getCurrentFont();
    const opacity = getCurrentOpacity();
    console.log(`Font family: ${font.family}`);
    console.log(`Font size: ${font.size}`);
    console.log(`Opacity: ${opacity}`);
    return;
  }

  if (['--opacity', '-o'].includes(command)) {
    const opacity = parseFloat(process.argv[3]);
    if (isNaN(opacity) || opacity < 0 || opacity > 1) {
      return console.log('Please provide a valid opacity (0.0 - 1.0)');
    }
    return applyOpacity(opacity);
  }

  if (['--select-opacity', '-O'].includes(command)) {
    const opacities = [0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];
    const originalOpacity = getCurrentOpacity();

    (async () => {
      const response = await prompts({
        type: 'autocomplete',
        name: 'opacity',
        message: 'Select opacity (0.0 = transparent, 1.0 = opaque)',
        choices: opacities.map((o) => ({
          title: String(o),
          value: o,
        })),
        onState: (state) => {
          if (state.value) {
            applyOpacity(state.value, true); // preview
          }
        },
      });

      if (response.opacity !== undefined) {
        applyOpacity(response.opacity);
      } else {
        // Cancelled, restore original
        applyOpacity(originalOpacity, true);
        console.log('Opacity selection cancelled, restored original.');
      }
    })();
    return;
  }

  if (['--select-font', '-S'].includes(command)) {
    const monoOnly = !process.argv.includes('--all');
    const fonts = getSystemFonts(monoOnly);
    const originalFont = getCurrentFont().family;

    if (fonts.length === 0) {
      return console.log('No fonts found');
    }

    (async () => {
      const response = await prompts({
        type: 'autocomplete',
        name: 'font',
        message: `Select a font (${monoOnly ? 'monospace only, use --all for all' : 'all fonts'})`,
        choices: fonts.map((f) => ({
          title: f,
          value: f,
        })),
        onState: (state) => {
          if (state.value) {
            applyFontFamily(state.value, true); // preview
          }
        },
      });

      if (response.font) {
        applyFontFamily(response.font);
      } else {
        // Cancelled, restore original
        applyFontFamily(originalFont, true);
        console.log('Font selection cancelled, restored original.');
      }
    })();
    return;
  }

  if (['--select-size', '-Z'].includes(command)) {
    const sizes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32];
    const originalSize = getCurrentFont().size;

    (async () => {
      const response = await prompts({
        type: 'autocomplete',
        name: 'size',
        message: 'Select a font size',
        choices: sizes.map((s) => ({
          title: String(s),
          value: s,
        })),
        onState: (state) => {
          if (state.value) {
            applyFontSize(state.value, true); // preview
          }
        },
      });

      if (response.size) {
        applyFontSize(response.size);
      } else {
        // Cancelled, restore original
        applyFontSize(originalSize, true);
        console.log('Size selection cancelled, restored original.');
      }
    })();
    return;
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
