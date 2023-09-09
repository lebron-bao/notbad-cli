"use strict";
const toString = Object.prototype.toString;

exports.isArray = function (arr) {
  return toString.call(arr) === "[object Array]";
};
exports.isObject = function (obj) {
  return toString.call(arr) === "[object Object]";
};

exports.spawn = function (command, args, options) {
  const win32 = process.platform === "win32";
  const cmd = win32 ? "cmd" : command;
  const cmdArgs = win32 ? ["/c"].concat(command, args) : args;
  return require("child_process").spawn(cmd, cmdArgs, options || {});
};
