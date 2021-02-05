# :rainbow: alacritty-themes :lollipop:

[![npm version](http://img.shields.io/npm/v/@rajasegar/alacritty-themes.svg?style=flat)](https://npmjs.org/package/@rajasegar/alacritty-themes "View this project on npm")

 Themes :candy: for [alacritty](https://github.com/alacritty/alacritty)  A cross-platform, GPU-accelerated terminal emulator 

To find the list of themes, you can visit the alacritty [wiki page](https://github.com/alacritty/alacritty/wiki/Color-schemes)

- 150+ Themes to choose from
- Option to create your `alacritty.yml` config file
- Simple, Easy and intuitive User experience

## Install

Install the `alacritty-themes` package globally with [npm](https://npmjs.com)
```
npm i -g alacritty-themes
```

If you are using `npx` you don't have to install the package:

```
npx alacritty-themes
```

## Usage

```
alacritty-themes
```

![alacritty-themes demo gif](demo.gif)

Choose the theme from the list of options by typing the theme name and press `Enter` to apply.
You can also navigate with `j` and `k` keys for up/down. The list of
options are cycled through automatically so you can go to the last theme
by just pressing `up arrow` key.
The search is fuzzy so you can enter any part of the theme name to search.

If no `alacritty.yml` is found in your `$HOME` path, it will ask you to create one.
You can choose to create one by confirming (`y/n`) and apply the selected theme.

## Bonus Tip: Alias
You can also create an alias for `alacritty-themes` like `at` 
Just append this below line to your `~/.bashrc` or `~/.bash_profile`

```
alias at='alacritty-themes'
```

Now you can simply use `at` to choose themes for your alacritty terminal.

```
at
```
