const fsExtra = require('fs-extra');
const path = require('path');
const appDataFolder = path.join(process.env.APPDATA, 'win-terminal-config');
const config = require('../config');
module.exports = {
  appDataFolder: (folderIn = '') => {
    const fullPath = path.join(appDataFolder, folderIn);
    fsExtra.ensureDirSync(fullPath);
    return fullPath;
  },
  randomArray: arr => arr[Math.floor(arr.length * Math.random())],
  uniformKeyword: keyword => keyword ? keyword.trim().toLowerCase() : '',
  get themePath() {
    return config.terminalProfilesJsonPath;
  },
  parseJsonTheme(jsonPath) {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  },
  saveJsonTheme(jsonPath, json) {
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
  }
};