const fsExtra = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const appDataFolder = path.join(process.env.APPDATA, 'win-terminal-config');
const config = require('../config');
module.exports = {
  get themePath() {
    return config.terminalProfilesJsonPath;
  },
  appDataFolder(folderIn = '') {
    const fullPath = path.join(appDataFolder, folderIn);
    fsExtra.ensureDirSync(fullPath);
    return fullPath;
  },
  randomArray(arr) {
    return arr[Math.floor(arr.length * Math.random())]
  },
  uniformKeyword(keyword) {
    return keyword ? keyword.trim().toLowerCase() : ''
  },
  generateRandomHex(length) {
    return crypto.randomBytes(length).toString('hex');
  },
  parseJsonTheme(jsonPath) {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  },
  saveJsonTheme(jsonPath, json) {
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
  }
};