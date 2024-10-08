const fs = require("fs");
const { exec } = require('child_process');
const gradient = require('gradient-string');

global.cc = {
    PREFIX: '',
    commands: {},
    events: {},
    config: {}
};

const loadConfig = () => {
    if (!fs.existsSync('./config.json')) {
        console.error(gradient.morning('Vui lòng tạo cấu hình Config.json'));
        process.exit(0);
    } else {
        global.cc.config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
        global.cc.PREFIX = global.cc.config.prefix;
        console.log(gradient.cristal('Config.json đã được tìm thấy!'));
    }
};

const loadCommands = () => {
    const commands = {};
    fs.readdirSync('./cmds').sort().forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const command = require(`../cmds/${file}`);
                global.cc.commands[command.name] = {
                    name: command.name,
                    usedby: command.usedby,
                    info: command.info,
                    onPrefix: command.onPrefix,
                    cooldowns: command.cooldowns
                };
                console.log(gradient.cristal(`[ ${command.name} ] Lệnh triển khai thành công`));
            } catch (error) {
                if (error.code === 'MODULE_NOT_FOUND') {
                    const missingModule = error.message.split("'")[1];
                    console.log(gradient.vice(`[ ${file} ] Lệnh này thiếu một module: ${missingModule}. Bắt đầu cài đặt...`));
                    exec(`npm install ${missingModule}`, (err, stdout, stderr) => {
                        if (err) {
                            console.error(gradient.passion(`Không thể cài đặt Module ${missingModule}: ${err}`));
                        } else {
                            console.log(gradient.atlas(`Module ${missingModule} Cài đặt thành công.`));
                            const command = require(`../cmds/${file}`);
                            global.cc.commands[command.name] = {
                                name: command.name,
                                usedby: command.usedby,
                                info: command.info,
                                onPrefix: command.onPrefix,
                                cooldowns: command.cooldowns
                            };
                            console.log(gradient.cristal(`[ ${command.name} ] Lệnh triển khai thành công`));
                        }
                    });
                } else {
                    console.error(gradient.passion(`[ ${file} ] Lệnh triển khai thành công ...: ${error}`));
                }
            }
        }
    });
};

const loadEventCommands = () => {
    const eventCommands = {};
    fs.readdirSync('./events').sort().forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const eventCommand = require(`../events/${file}`);
                global.cc.events[eventCommand.name] = eventCommand;
                console.log(gradient.pastel(`[ ${eventCommand.name} ] Triển khai thành công lệnh sự kiện`));
            } catch (error) {
                if (error.code === 'MODULE_NOT_FOUND') {
                    const missingModule = error.message.split("'")[1];
                    console.log(gradient.instagram(`[ ${file} ] Lệnh sự kiện này thiếu một module: ${missingModule}. Installing...`));
                    exec(`npm install ${missingModule}`, (err, stdout, stderr) => {
                        if (err) {
                            console.error(gradient.instagram(`Không thể cài đặt module ${missingModule}: ${err}`));
                        } else {
                            console.log(gradient.atlas(`Module ${missingModule} đã cài đặt thành công.`));
                            const eventCommand = require(`../events/${file}`);
                            global.cc.events[eventCommand.name] = eventCommand;
                            console.log(gradient.cristal(`[ ${eventCommand.name} ] Triển khai thành công lệnh sự kiện`));
                        }
                    });
                } else {
                    console.error(gradient.summer(`[ ${file} ] Lệnh sự kiện này có lỗi: ${error}`));
                }
            }
        }
    });
};

module.exports = { loadCommands, loadEventCommands, loadConfig };
