const ModeLoader = require('../mode-loader');
const speedTest = require('speedtest-net');

module.exports = class TestLoader extends ModeLoader {
  constructor() {
    super(['test'], 'generic tests for your pc');

    this.defineCommand('network-speed', () => 'test your network speed with speedtest: network-speed [seconds to test]', async args => {
      const [durationSecondsArg] = args;
      const defaultSpeedTestSeconds = 6;
      const durationSeconds = durationSecondsArg ? Number(durationSecondsArg) : defaultSpeedTestSeconds;
      if (Number.isNaN(durationSeconds)) {
        throw new Error('Invalid number for duration entered');
      }
      if (durationSeconds <= 0) {
        throw new Error('Duration must be at least positive');
      }
      speedTest.visual({ maxTime: durationSeconds * 1000 });
      return false;
    });
  }
};