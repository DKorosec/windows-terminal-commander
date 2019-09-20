const fsExtra = require('fs-extra');
const path = require('path');
const appDataFolder = path.join(process.env.APPDATA, 'win-terminal-config');
module.exports = {
  appDataFolder: (file = '') => {
    fsExtra.ensureDirSync(appDataFolder);
    return path.join(appDataFolder, file);
  },
  randomArray: arr => arr[Math.floor(arr.length * Math.random())],
  uniformKeyword: keyword => keyword ? keyword.trim().toLowerCase() : ''
};