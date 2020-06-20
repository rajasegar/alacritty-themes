# alacritty-themes
Themes for [alacritty](https://github.com/alacritty/alacritty)  A cross-platform, GPU-accelerated terminal emulator 

To find the list of themes, you can visit the alacritty [wiki page](https://github.com/alacritty/alacritty/wiki/Color-schemes)

- 50+ Themes to choose from
- Option to create your `alacritty.yml` config file

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

Choose the theme from the list of options and press Enter to apply.

If no `alacritty.yml` is found in your `$HOME` path, it will ask you to create one.
You can choose to create one (`y/n`) and apply the selected theme.

## Alias
You can also choose to create an alias for `alacritty-themes` like `at` 
Just append this below line to your `~/.bashrc` or `~/.bash_profile`

```
alias at='alacritty-themes'
```

Now you can simply use `at` to choose themes for your alacritty terminal.

```
at
```
