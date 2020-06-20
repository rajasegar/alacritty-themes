const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

module.exports = function(theme) {
  const file = fs.readFileSync('./alacritty.yml', 'utf8');

  const themeFile = fs.readFileSync(`./themes/${theme}.yml`, 'utf8');

  const doc = YAML.parseDocument(file);

  const themeDoc = YAML.parseDocument(themeFile);

  const colors = doc.contents.items.filter( i => i.key.value === 'colors')[0];
  const themeColors = themeDoc.contents.items.filter( i => i.key.value === 'colors')[0];

  colors.value = themeColors.value;

  const newContent = String(doc);

  const ymlPath = path.resolve(process.env.HOME, '.config/alacritty/alacritty.yml');

  fs.writeFile(ymlPath,newContent, 'utf8', (err) => {
    if (err) throw err;
      console.log(`The theme ${theme} has been applied successfully!`);
  });
};
