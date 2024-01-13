import toml
import yaml
import os

themes_dir = './themes'
for file in os.listdir(themes_dir):
    file = os.path.join(themes_dir, file)
    if file.endswith('.yml'):
        with open(file, 'r') as f:
            data = yaml.load(f, Loader=yaml.FullLoader)
        with open(file.replace('.yml', '.toml'), 'w') as f:
            if 'name' in data['colors']:
                f.write('# Name: ' + data['colors']['name'] + '\n')
                del data['colors']['name']
            if 'author' in data['colors']:
                f.write('# Author: ' + data['colors']['author'] + '\n\n')
                del data['colors']['author']
            toml.dump(data, f)
