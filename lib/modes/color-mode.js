const ModeLoader = require('../mode-loader');
const request = require('request-promise');
const utils = require('../util');

module.exports = class BackgroundLoader extends ModeLoader {
  constructor() {
    super(['color'], 'sets different colors');
  }

  validateColor(color) {
    if (!/^#[A-F\d]{6}$/i.test(color)) {
      throw new Error('color must be #RRGGBB in hex (example: #00FF00)');
    }
  }

  async run(args) {
    const [mode, colorInfo] = args;
    const colorMode = utils.uniformKeyword(mode);
    const color = utils.uniformKeyword(colorInfo);

    switch (colorMode) {
      case 'foreground':
        this.validateColor(color);
        this.jsonProfile.foreground = color;
        return true;
      case 'background':
        this.validateColor(color);
        this.jsonProfile.background = color;
        return true;
      default:
        console.log('supported color modes: ');
        console.log('foreground #RRGGBB');
        console.log('background #RRGGBB');
        break;
    }
    return false;
  }
}