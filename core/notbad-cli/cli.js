#!/usr/bin/env node

"use strict";
const importlocal = require("import-local");
if (importlocal(__filename)) {
  require("npmlog").info("cli", "using local version of lerna");
} else {
  require(".")(process.argv.slice(2));
}
