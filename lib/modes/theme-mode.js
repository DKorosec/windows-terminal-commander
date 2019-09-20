const ModeLoader = require('../mode-loader');
const utils = require('../util');
const folderThemes = utils.appDataFolder(`theme-loader-saved`);
const path = require('path');
const fsExtra = require('fs-extra');


module.exports = class ThemeLoader extends ModeLoader {
  constructor() {
    super(['theme'], 'sets / saves themes');
    const themes = fsExtra.readdirSync(folderThemes);
    this.defineCommand('list', () => 'list saved themes', () => {
      console.log('saved themes:', themes.join(', '));
      return false;
    });
    this.defineCommand('set', () => 'set theme-name', args => {
      const [themeName] = args;
      if (!themeName) {
        throw new Error('theme name not specified');
      }
      fsExtra.copyFileSync(utils.themePath, path.join(folderThemes, themeName));
      return false;
    });
    this.defineCommand('load', () => 'load theme-name', args => {
      const [themeName] = args;
      if (!themeName) {
        throw new Error('theme name not specified');
      }
      fsExtra.copyFileSync(path.join(folderThemes, themeName), utils.themePath);
      return false;
    });
    this.defineCommand('delete', () => 'delete theme-name', args => {
      const [themeName] = args;
      if (!themes.includes(themeName)) {
        throw new Error('name not found in saved themes');
      }
      fsExtra.removeSync(path.join(folderThemes, themeName));
      return false;
    });
  }
}
