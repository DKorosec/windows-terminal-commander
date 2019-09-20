const ModeLoader = require('../mode-loader');
const request = require('request-promise');
const utils = require('../util');
const path = require('path');
const fsExtra = require('fs-extra');

const folderSavedBgs = utils.appDataFolder(`background-loader-saved`);
const folderCustomBgs = utils.appDataFolder(`background-loader-custom`);

module.exports = class BackgroundLoader extends ModeLoader {
  constructor() {
    super(['bg', 'background', 'image'], 'sets different background images');
  }

  async run(args) {
    const [backgroundMode, ...argsv2] = args;
    const savedImages = fsExtra.readdirSync(folderSavedBgs);
    switch (utils.uniformKeyword(backgroundMode)) {
      case 'use': {
        const [bgName] = argsv2;
        if (!savedImages.includes(bgName)) {
          throw new Error('name not found in saved images');
        }
        this.jsonProfile.backgroundImage = path.join(folderSavedBgs, bgName);
        return true;
      }
      case 'use-random': {
        this.jsonProfile.backgroundImage = path.join(folderSavedBgs, utils.randomArray(savedImages));
        return true;
      }
      case 'weather': {
        const weatherUrl = 'https://www.arso.gov.si/vreme/napovedi%20in%20podatki/radar_anim.gif'
        this.jsonProfile.backgroundImage = await this.setCustomImage(weatherUrl);
        return true;
      }
      case 'xkcd': {
        const [comicNum] = argsv2;
        this.jsonProfile.backgroundImage = await this.setXkcdImage(comicNum);
        return true;
      }
      case 'stretch-mode': {
        const [fillType] = argsv2;
        this.jsonProfile.backgroundImageStretchMode = this.setStretchMode(fillType);
        return true;
      }
      case 'set-custom': {
        const [imgURI] = argsv2;
        this.jsonProfile.backgroundImage = await this.setCustomImage(imgURI);
        return true;
      }
      case 'list': {
        console.log('saved backgrounds:', savedImages.join(', '));
        return false;
      }
      case 'save-as': {
        const [bgName] = argsv2;
        if (!bgName) {
          throw new Error('name is missing');
        }
        const currentPath = this.jsonProfile.backgroundImage;
        const storePath = path.join(folderSavedBgs, bgName);
        fsExtra.copyFileSync(currentPath, storePath);
        return false;
      }
      case 'delete': {
        const [bgName] = argsv2;
        if (!savedImages.includes(bgName)) {
          throw new Error('name not found in saved images');
        }
        fsExtra.removeSync(path.join(folderSavedBgs, bgName));
        return false;
      }
      default:
        console.log('saved backgrounds: ');
        console.log('\tuse [bg-name] (', savedImages.join(', '), ')');
        console.log('use xkcd from the www:');
        console.log('\txkcd [number|random]');
        console.log('you can also set custom background:');
        console.log('\tset-custom PATH|URL');
        console.log('you can set the stretch mode for background:')
        console.log('stretch-mode none|fill|uniform|uniformToFill|toggle');
        break;
    }
    return false;
  }

  setStretchMode(fillType) {
    const toggles = ['none', 'fill', 'uniform', 'uniformToFill'];
    switch (fillType) {
      case 'toggle':
        const prevMode = this.jsonProfile.backgroundImageStretchMode;
        const nextI = toggles.indexOf(prevMode) + 1;
        const nextMode = toggles[nextI % toggles.length];
        return nextMode;
      default:
        if (!toggles.includes(fillType)) {
          throw new Error(`fill type must be one of the: ${toggles.join(', ')}`);
        }
        return fillType;
    }
  }

  async setXkcdImage(comicNum = '') {
    if (utils.uniformKeyword(comicNum) === 'random') {
      const { num } = await request.get(`https://xkcd.com/info.0.json`, { json: true });
      comicNum = Math.floor(Math.random() * num) + 1;
    }
    const { img: imgURI } = await request.get(`https://xkcd.com/${comicNum}/info.0.json`, { json: true });
    return await this.setCustomImage(imgURI);
  }

  async setCustomImage(imgURI) {
    if (/^[a-z]:[\\/]/i.test(imgURI)) {
      //handle file;
      // lets just hope this fucker knows what he's doing.
      return imgURI;
    }
    if (/^http(s?):\/\//i.test(imgURI)) {
      //handle url;
      // why did i implement this ...
      const imgResponse = await request.get(imgURI, { encoding: null });
      const imgBuffer = Buffer.from(imgResponse);
      const filePath = path.join(folderCustomBgs, require('crypto').randomBytes(32).toString('hex'));
      fsExtra.writeFileSync(filePath, imgBuffer);
      return filePath;
    }
    throw new Error(`unsupported imgURI: ${imgURI}`);
  }
}