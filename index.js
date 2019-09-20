#!/usr/bin/env node
const ModeLoader = require('./lib/mode-loader');
const fs = require('fs');
async function main() {
  const jsonPath = 'C:/Users/dominikk/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/profiles.json';
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const [, , modeKeyword, ...args] = process.argv;
  const modes = ModeLoader.LoadModes();
  const selectedMode = modes.find(mode => mode.isSelected(modeKeyword));
  if (!selectedMode) {
    console.log('Selected mode is not supported. You can chose:');
    modes.forEach(m => console.log(m.help));
    process.exit(0);
  }
  selectedMode._bindTerminalConfig(json);
  try {
    if (await selectedMode.run(args)) {
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
    }
  } catch (err) {
    console.log(`command error:\n`, err, '\nargs:', args);
  }
  console.log('');
}
main();