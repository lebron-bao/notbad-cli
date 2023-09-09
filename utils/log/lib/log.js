"use strict";
const log = require("npmlog");
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info"; // 判断debug模式

log.heading = "notbad-cli";
log.addLevel("success", 2000, { fg: "green", bold: true }); // 自定义
module.exports = log;
