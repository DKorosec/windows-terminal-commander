const ModeLoader = require('../mode-loader');
const utils = require('../util');
const scriptFolder = utils.appDataFolder(`script-loader-saved`);
const path = require('path');
const fsExtra = require('fs-extra');
const util = require('util');
const { spawn, execFile: execFileCB } = require('child_process');
const execFile = util.promisify(execFileCB);

module.exports = class ThemeLoader extends ModeLoader {
  constructor() {
    super(['script'], 'runs / saves custom nodejs scripts');
    const scripts = fsExtra.readdirSync(scriptFolder);

    this.defineCommand('list', () => 'list saved scripts', () => {
      console.log('saved scripts:', scripts.join(', '));
      return false;
    });

    this.defineCommand('save', () => 'save script-name script-path', args => {
      const [scriptName, scriptPath] = args;
      if (!scriptName) {
        throw new Error('script name not specified');
      }
      if (!scriptPath) {
        throw new Error('script path not specified');
      }
      fsExtra.copyFileSync(scriptPath, path.join(scriptFolder, scriptName));
      return false;
    });

    this.defineCommand('run', () => 'run script-name [scriptargs]', async args => {
      const [scriptName, ...sargs] = args;
      if (!scriptName) {
        throw new Error('script name not specified');
      }
      const scriptPath = path.join(scriptFolder, scriptName);
      const processOut = await execFile('node', [scriptPath, ...sargs], { shell: true });
      if (processOut.stdout) {
        console.log('stdout:\n', processOut.stdout);
      }
      if (processOut.stderr) {
        console.log('stderr:\n', process.stderr);
      }
      return false;
    });

    this.defineCommand('run-async', () => '(starts script in background) run script-name [scriptargs]', async args => {
      const [scriptName, ...sargs] = args;
      if (!scriptName) {
        throw new Error('script name not specified');
      }
      const scriptPath = path.join(scriptFolder, scriptName);
      const subprocess = spawn('node', [scriptPath, ...sargs], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
        shell: false
      });
      subprocess.unref();
      return false;
    });

    this.defineCommand('delete', () => 'delete script-name', args => {
      const [scriptName] = args;
      if (!scripts.includes(scriptName)) {
        throw new Error('name not found in saved scripts');
      }
      fsExtra.removeSync(path.join(scriptFolder, scriptName));
      return false;
    });
  }
}
