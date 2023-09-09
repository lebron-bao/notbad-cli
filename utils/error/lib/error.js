"use strict";
const log = require("@notbad-cli/log");
class ErrorHandle {
  throwError(errMessage) {
    log.error(errMessage);
    process.exit(0);
  }
}

module.exports = ErrorHandle;
