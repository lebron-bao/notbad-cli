"use strict";
const path = require("path");
const pkg = require("./package.json");
const userhome = require("user-home");
const colors = require("colors/safe");
const pathExists = require("path-exists").sync;
const constant = require("./const");
const log = require("@notbad-cli/log");
const commander = require("commander");
const program = new commander.Command();
const packageJson = require("./package.json");
const exec = require("@notbad-cli/exec");
const { getLatestVersion } = require("@notbad-cli/getversions");
const semver = require("semver");
const main = async function (argv) {
  try {
    await prepare();
  } catch (error) {
    log.error("ERROR", error.message);
  }
};
async function prepare() {
  await checkPkgVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  registerCommand();
}

function registerCommand() {
  program
    .name(packageJson.name)
    .usage("<command> [option]")
    .version(packageJson.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-tp, --targetPath <targetPath>", "是否指定本地调试文件路径", "");
  program
    .command("init")
    .description("init your project")
    .argument("<projectName>", "your project name")
    .option("-f, --force", "是否强制初始化项目")
    .action(exec);

  program.on("option:debug", function () {
    log.level = process.env.LOG_LEVEL = "verbose";
  });
  const opts = program.opts();
  // 指定targetPath
  program.on("option:targetPath", function () {
    process.env.CLI_TARGET_PATH = opts.targetPath;
  });
  // 对未知命令监听
  program.on("command:*", function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    console.log(colors.red("未知的命令：" + obj[0]));
    if (availableCommands.length > 0) {
      console.log(colors.red("可用命令：" + availableCommands.join(",")));
    }
  });
  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
  }
}
function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userhome, ".env");
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig();
}
function createDefaultConfig() {
  const cliConfig = {
    home: userhome,
  };
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userhome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userhome, constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}
function checkUserHome() {
  if (!userhome || !pathExists(userhome)) {
    throw new Error(
      colors.red(
        "The home directory of the currently logged-in user does not exist!"
      )
    );
  }
}
async function checkPkgVersion() {
  const curPkgVersion = packageJson.version;
  log.info("current version", curPkgVersion);
  // const curPkgName = packageJson.name;
  const curPkgName = "vue";
  try {
    const latestVersion = await getLatestVersion(curPkgName);
    if (latestVersion && semver.gt(latestVersion, curPkgVersion)) {
      log.verbose("notbad-cli latestVersion", latestVersion);
      log.warn("notbad-cli has been updated to ", colors.green(latestVersion));
    } else {
      log.info("Latest version:", curPkgVersion);
    }
  } catch (error) {
    log.error("ERROR:", error.message);
    // process.exit();
  }
}
function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}
module.exports = main;
