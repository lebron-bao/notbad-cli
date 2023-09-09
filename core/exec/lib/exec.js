"use strict";
const path = require("path");
const log = require("@notbad-cli/log");
const { OriginPackage } = require("@notbad-cli/package");
const { spawn } = require("@notbad-cli/util");
const cacheDir = "cache";
module.exports = exec;
const cmdMapPkg = {
  init: "@notbad-cli/init",
};
async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose("target path:", targetPath ?? "No targetpath is specified");
  log.verbose("home path:", homePath);
  const command = arguments[arguments.length - 1];
  const cmd = command.name();
  const pkgName = cmdMapPkg[cmd];
  const pkgVersion = "latest";
  //调试init
  require("@notbad-cli/init").call(null, arguments);
  //   if (targetPath) {
  //   } else {
  //     const cachePath = path.resolve(homePath, cacheDir);
  //     const originPkg = new OriginPackage({
  //       cachePath,
  //       pkgName,
  //       pkgVersion,
  //       homePath,
  //     });
  //     await originPkg.install();
  //     const entry = await originPkg.getPkgEntryFile();
  //     const code = `require('${entry}').call(null)`;
  //     const child = spawn("node", ["-e", code], {
  //       cwd: process.cwd(),
  //       stdio: "inherit",
  //     });
  //     child.on("error", (e) => {
  //       log.error(e.message);
  //       process.exit(1);
  //     });
  //     child.on("exit", (e) => {
  //       log.verbose("The child process executed the command success:" + e);
  //       process.exit(e);
  //     });
  //   }
}
