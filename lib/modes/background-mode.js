const ModeLoader = require('../mode-loader');
const request = require('request-promise');
const utils = require('../util');
const path = require('path');
const fsExtra = require('fs-extra');
const captureWebsite = require('capture-website');

const folderSavedBgs = utils.appDataFolder(`background-loader-saved`);
const folderCustomBgs = utils.appDataFolder(`background-loader-custom`);
const stretchToggles = ['none', 'fill', 'uniform', 'uniformToFill'];
module.exports = class BackgroundLoader extends ModeLoader {
  constructor() {
    super(['bg', 'background', 'image'], 'sets different background images');
    const savedImages = fsExtra.readdirSync(folderSavedBgs);

    this.defineCommand('use', () => `use [bg-name] (${savedImages.join(', ')})`, argsv2 => {
      const [bgName] = argsv2;
      if (!savedImages.includes(bgName)) {
        throw new Error('name not found in saved images');
      }
      this.jsonProfile.backgroundImage = path.join(folderSavedBgs, bgName);
      return true;
    });

    this.defineCommand('use-random', () => 'selects random saved background', () => {
      this.jsonProfile.backgroundImage = path.join(folderSavedBgs, utils.randomArray(savedImages));
      return true;
    });

    this.defineCommand('weather', () => 'gets latest weather gif from arso', async () => {
      const weatherUrl = 'https://www.arso.gov.si/vreme/napovedi%20in%20podatki/radar_anim.gif'
      this.jsonProfile.backgroundImage = await this.setCustomImage(weatherUrl);
      return true;
    });

    this.defineCommand('xkcd', () => 'xkcd [number|random]', async argsv2 => {
      const [comicNum] = argsv2;
      this.jsonProfile.backgroundImage = await this.setXkcdImage(comicNum);
      return true;
    });

    this.defineCommand('stretch-mode', () => `stretch-mode ${stretchToggles.join(' | ')} | toggle`, argsv2 => {
      const [fillType] = argsv2;
      this.jsonProfile.backgroundImageStretchMode = this.setStretchMode(fillType);
      return true;
    })

    this.defineCommand('set-custom', () => 'set-custom PATH|URL', async argsv2 => {
      const [imgURI] = argsv2;
      this.jsonProfile.backgroundImage = await this.setCustomImage(imgURI);
      return true;
    });

    this.defineCommand('set-page', () => 'set-page PATH|URL', async argsv2 => {
      const [imgURI] = argsv2;
      this.jsonProfile.backgroundImage = await this.setCustomScreenshot(imgURI);
      return true;
    });

    this.defineCommand('list', () => 'lists saved backgrounds to use', () => {
      console.log('saved backgrounds:', savedImages.join(', '));
      return false;
    });

    this.defineCommand('save-as', () => 'save-as bg-name', argsv2 => {
      const [bgName] = argsv2;
      if (!bgName) {
        throw new Error('name is missing');
      }
      const currentPath = this.jsonProfile.backgroundImage;
      const storePath = path.join(folderSavedBgs, bgName);
      fsExtra.copyFileSync(currentPath, storePath);
      return false;
    });
    
    this.defineCommand('delete', () => 'delete bg-name', argsv2 => {
      const [bgName] = argsv2;
      if (!savedImages.includes(bgName)) {
        throw new Error('name not found in saved images');
      }
      fsExtra.removeSync(path.join(folderSavedBgs, bgName));
      return false;
    });
  }

  setStretchMode(fillType) {
    const toggles = stretchToggles;
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
      return imgURI;
    }
    if (/^http(s?):\/\//i.test(imgURI)) {
      //handle url;
      const imgResponse = await request.get(imgURI, { encoding: null });
      const imgBuffer = Buffer.from(imgResponse);
      const filePath = path.join(folderCustomBgs, require('crypto').randomBytes(32).toString('hex'));
      fsExtra.writeFileSync(filePath, imgBuffer);
      return filePath;
    }
    throw new Error(`unsupported imgURI: ${imgURI}`);
  }

  async setCustomScreenshot(websiteURI){
    const filePath = path.join(folderCustomBgs, require('crypto').randomBytes(32).toString('hex'));
    await captureWebsite.file(websiteURI, filePath);
    return filePath
  }
}
