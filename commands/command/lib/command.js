"use strict";
const ErrorHandle = require("@notbad-cli/error");
const semver = require("semver");
const colors = require("colors");
class Command extends ErrorHandle {
  constructor(argv) {
    super();
    if (!argv) {
      this.throwError("参数不能为空！");
    }
    if (!Array.isArray(argv)) {
      this.throwError("参数必须为数组！");
    }
    if (argv.length < 1) {
      this.throwError("参数列表为空！");
    }

    this._argv = argv;
    this._cmd = argv[2];
    this._options = argv[1];
    this.run();
  }
  async run() {
    await this.checkNodeVersion();
    await this.init();
    await this.exec();
  }
  async checkNodeVersion() {
    const v = process.version;
    const lowVersion = "12.0.0";
    if (!semver.gte(v, lowVersion)) {
      this.throwError(`@notbad-cli/init version must more than v${lowVersion}`);
    }
  }

  init() {
    this.throwError("子类必须实现init方法");
  }
  exec() {
    this.throwError("子类必须实现exec方法");
  }
}

module.exports = Command;
