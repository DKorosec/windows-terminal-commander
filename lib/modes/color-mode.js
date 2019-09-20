const ModeLoader = require('../mode-loader');
const request = require('request-promise');
const utils = require('../util');

module.exports = class BackgroundLoader extends ModeLoader {
  constructor() {
    super(['color'], 'sets different colors');
    this.defineCommand('foreground', () => 'foreground #RRGGBB', args => {
      const [colorInfo] = args;
      const color = utils.uniformKeyword(colorInfo);
      this.assertColor(color);
      this.jsonProfile.foreground = color;
      return true;
    });
    this.defineCommand('background', () => 'background #RRGGBB', args => {
      const [colorInfo] = args;
      const color = utils.uniformKeyword(colorInfo);
      this.assertColor(color);
      this.jsonProfile.background = color;
      return true;
    });
  }

  assertColor(color) {
    if (!/^#[A-F\d]{6}$/i.test(color)) {
      throw new Error('color must be #RRGGBB in hex (example: #00FF00)');
    }
  }
}
