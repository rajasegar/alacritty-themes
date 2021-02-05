'use strict';

// this is the conversion script to
// convert the themes in terminal.sexy repo
// from json to yml
const yaml = require('yaml');

const fs = require('fs');
const path = require('path');

console.log('Convert yml to js');

const base16 = path.resolve('../terminal.sexy/dist/schemes/base16');
const collection = path.resolve('../terminal.sexy/dist/schemes/collection');
const xcolors = path.resolve('../terminal.sexy/dist/schemes/xcolors.net');
const folders = [base16, collection, xcolors];
//console.log(folder);

folders.forEach((folder) => {
  fs.readdir(folder, (err, files) => {
    if (err) throw err;
    console.log(files);
    files.forEach((f) => {
      const data = fs.readFileSync(`${folder}/${f}`, 'utf8');
      const json = JSON.parse(data);
      const newJson = {
        colors: {
          name: json.name,
          author: json.author,
          primary: {
            background: json.background,
            foreground: json.foreground,
          },
          cursor: {
            text: json.background,
            cursor: json.foreground,
          },
          normal: {
            black: json.color[0],
            red: json.color[1],
            green: json.color[2],
            yellow: json.color[3],
            blue: json.color[4],
            magenta: json.color[5],
            cyan: json.color[6],
            white: json.color[7],
          },
          bright: {
            black: json.color[8],
            red: json.color[9],
            green: json.color[10],
            yellow: json.color[11],
            blue: json.color[12],
            magenta: json.color[13],
            cyan: json.color[14],
            white: json.color[15],
          },
        },
      };
      const output = yaml.stringify(newJson);
      const _baseName = path.basename(f, '.json');
      const fileName = _baseName[0].toUpperCase() + _baseName.slice(1) + '.yml';
      const ymlFile = 'themes/' + fileName;
      if (!fs.existsSync(ymlFile)) {
        fs.writeFile(ymlFile, output, (err) => {
          if (err) throw err;
          console.log(`${ymlFile} written successfully.`);
        });
      }
    });
  });
});
