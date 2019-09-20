const util = require('./util');
const fs = require('fs');
const path = require('path');
module.exports = class ModeLoader {
  constructor(keywords = [], info = 'No information has been specified by the developer :(') {
    this.keywords = keywords.map(k => util.uniformKeyword(k));
    this.info = info;
    this.terminalConfig = null;
    this.commands = [];
  }

  defineCommand(activateWord, usecaseFn, runFn) {
    this.commands.push({
      activateWord: util.uniformKeyword(activateWord),
      usecaseFn,
      runFn
    });
  }

  async findRunCommand(keyword, args) {
    const findkw = util.uniformKeyword(keyword);
    const cmd = this.commands.find(cmd => cmd.activateWord === findkw);
    if (!cmd) {
      console.log(this.detailHelp);
      return false;
    }
    return cmd.runFn(args);
  }

  get detailHelp() {
    let str = `Command: ${this.keywords.join(', ')}\n\t-> ${this.info}`
    str += '\n';
    this.commands.forEach(cmd => {
      str += ' =>'
      str += cmd.activateWord;
      str += '\n\t';
      str += cmd.usecaseFn();
      str += '\n\n';
    });
    return str;
  }

  get help() {
    return `Keywords:\n\t${this.keywords.join(', ')}\n\t-> ${this.info}`;
  }

  static LoadModes() {
    const modesPath = path.join(__dirname, 'modes');
    return fs.readdirSync(modesPath)
      .map(mode => new (require(`${modesPath}/${mode}`)));
  }

  get jsonProfile() {
    return this.terminalConfig.profiles[0];
  }

  _bindTerminalConfig(terminalConfig) {
    this.terminalConfig = terminalConfig;
  }

  isSelected(keyword) {
    return this.keywords.includes(util.uniformKeyword(keyword));
  }

  async run(args) {
    const [kw, ...argv] = args;
    return await this.findRunCommand(kw, argv);
  }
}
