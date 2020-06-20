const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const ymlPath = path.resolve(process.env.HOME, '.config/alacritty/alacritty.yml');

function updateTheme(data, theme) {

  const themeFile = fs.readFileSync(`./themes/${theme}.yml`, 'utf8');

  const doc = YAML.parseDocument(data);

  const themeDoc = YAML.parseDocument(themeFile);

  const colors = doc.contents.items.filter( i => i.key.value === 'colors')[0];
  const themeColors = themeDoc.contents.items.filter( i => i.key.value === 'colors')[0];

  colors.value = themeColors.value;

  const newContent = String(doc);


  fs.writeFile(ymlPath,newContent, 'utf8', (err) => {
    if (err) throw err;
    console.log(`The theme ${theme} has been applied successfully!`);
  });
}

module.exports = function(theme) {

  fs.readFile(ymlPath, 'utf8', (err, data) => {

    if(err) {
      const createConfigPrompt = {
        type: 'confirm',
        name: 'createConfig',
        message: 'Looks like you don\'t have alacritty config file. Do you want to create one?'
      };

      inquirer.prompt(createConfigPrompt).then((answers) => {

        if(answers.createConfig) {

          const configTemplate = fs.readFileSync('./alacritty.yml', 'utf8');

          fs.writeFile(ymlPath,configTemplate, 'utf8', (err) => {
            if(err) throw err;
            console.log('New config file created.');
            updateTheme(configTemplate, theme);
          });
        }
      });

    } else {
      updateTheme(data, theme);
    }

  });

};
