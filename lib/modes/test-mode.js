const ModeLoader = require('../mode-loader');

const DraftLog = require('draftlog');
DraftLog(console);
require('draftlog').into(console);
require('draftlog').into(console).addLineListener(process.stdin);

module.exports = class TestLoader extends ModeLoader {
    constructor(){
        super(['test'], 'tests something');

        this.defineCommand('speed', () => 'test network speed', () => {
            const speedTest = require('speedtest-net');
            const st = speedTest();
            const update = console.draft("Starting..");

            let downloadSpeed = "";
            let uploadSpeed = "";
            let spinner = ["◇", "◈", "◆"];

            st.on('downloadspeedprogress', speed => {
                downloadSpeed = (((speed * 125).toFixed(2)).toString() + 'KB/s');
                update("[\x1b[33m" + spinner[0] +  "\x1b[0m] Download: \x1b[36m" + downloadSpeed + "\x1b[0m\n[\x1b[31m◇\x1b[0m] Upload: " + uploadSpeed + "\x1b[0m\n");
                var last = spinner.pop()
                spinner.unshift(last);
            });

            st.on('downloadspeed', speed => {
                update("[\x1b[32m◆\x1b[0m] Download: \x1b[42m" + downloadSpeed + "\x1b[33" + spinner[0] +"\x1b[0m\n[\x1b[33m" + spinner[0] +  "\x1b[0m] Upload:\x1b[36m" + uploadSpeed + "\x1b[0m\n");
            });

            st.on('uploadspeedprogress', speed => {
                uploadSpeed = (((speed * 125).toFixed(2)).toString() + 'KB/s');
                update("[\x1b[32m◆\x1b[0m] Download: \x1b[42m" + downloadSpeed + "\x1b[33" + spinner[0] +"\x1b[0m\n[\x1b[33m" + spinner[0] +  "\x1b[0m] Upload:\x1b[36m" + uploadSpeed + "\x1b[0m\n");

                var last = spinner.pop()
                spinner.unshift(last);
            });

            st.on('data', data => {
                update("[\x1b[32m◆\x1b[0m] Download: \x1b[42m" + downloadSpeed + "\x1b[0m\n[\x1b[32m◆\x1b[0m] Upload:\x1b[42m" + uploadSpeed + "\x1b[0m\n" +
                    "\nReport\n" +
                    "__________________________________________\n" +
                    "Download: \x1b[42m" + data.speeds.download + "\x1b[0m MBit/s \n Upload: \x1b[42m" + data.speeds.upload + "\x1b[0m MBit/s ");
            });
            return false;
        });
    }
};