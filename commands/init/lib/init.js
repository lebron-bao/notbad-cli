"use strict";
const Command = require("@notbad-cli/command");
const semver = require("semver");
const inquirer = require("inquirer");
const fsExtra = require("fs-extra");
const log = require("@notbad-cli/log");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const moment = require("moment");
const {
  getTemplate,
  getChoiceTemplateContent,
  getTemplateTypeDir,
  downloadFile,
} = require("@notbad-cli/request");
const ora = require("ora");
const spinner = ora();
const download = require("download-git-repo");
const chalk = require("chalk");

class InitCommand extends Command {
  constructor(argv) {
    super(argv);
  }
  init() {
    this.projectName = this._argv[0] ?? "";
    this.force = this._options.force;
    log.verbose("your project name:" + this.projectName);
    log.verbose("force :" + this.force);
  }
  async exec() {
    await this.prepare();
    const info = await this.getTemplateInfo();
    if (info) {
      log.verbose("choose info:", JSON.stringify(info));
      this._info = info;
      await this.getChoiceTempDownloadInfo();
      await this.processRemoteFiles();
      await this.downloadRemoteFiles();
    }
  }
  //ico & png error  npm install not complate
  async ejsRender() {
    // console.log(this._info);
    const renderFiles = this._renderFiles.map((file) => {
      if (file.name === "package.json") {
        const pkgContent = file.content;
        const renderAfterContent = ejs.render(pkgContent, {
          name: this._info.projectName,
          version: this._info.projectVersion,
          description: "",
        });
        file.content = renderAfterContent;
      }
      return file;
    });
    const RecursiveRender = (files, dir) => {
      fsExtra.mkdirSync(dir);
      files.forEach((file) => {
        const { name, childFile } = file;
        if (childFile) {
          RecursiveRender(childFile, dir + "/" + name);
        } else {
          fsExtra.writeFileSync(dir + "/" + name, file.content);
        }
      });
    };
    RecursiveRender(
      renderFiles,
      this._cwd.replaceAll(/\\/g, "/") + "/" + this.projectName
    );
  }
  async downloadRemoteFiles() {
    const _this = this;
    spinner.start("download template start");
    async function RecursiveFiles(files) {
      const result = files.map(async (file) => {
        if (file.childFile) {
          const newChildFiles = await RecursiveFiles(file.childFile);
          file.childFile = newChildFiles;
          return file;
        } else {
          const downloadUrl = file.download;
          try {
            let result = await downloadFile(downloadUrl);
            result = Buffer.from(result.content, "base64").toString("utf-8");
            return { name: file.name, content: result };
          } catch (error) {
            console.log(error);
            spinner.fail("download template stop");
            _this.throwError(chalk.red("download template error"));
          }
        }
      });
      return Promise.all(result);
    }
    this._renderFiles = await RecursiveFiles(this._processedRemoteFileMess);
    await this.ejsRender();
    spinner.succeed("download template successed");
  }
  async processRemoteFiles() {
    const _this = this;
    async function Recursive(infos) {
      infos = infos.map(async (info) => {
        if (info.type === "dir") {
          try {
            const result = await getTemplateTypeDir(info.path);
            if (Array.isArray(result) && result.length > 0) {
              info.childFile = await Recursive(result);
            }
            return {
              name: info.name,
              childFile: info.childFile,
            };
          } catch (error) {
            console.log(error);
            _this.throwError(error);
          }
        }
        return { name: info.name, download: info["git_url"] };
      });
      return Promise.all(infos);
    }
    const result = await Recursive(this._choiceTempDownloadInfo);
    this._processedRemoteFileMess = result;
  }
  async getChoiceTempDownloadInfo() {
    spinner.start(chalk.grey("start pull choice template"));
    const choiceTempInfo = this._info.projectTemplate;
    try {
      const result = await getChoiceTemplateContent(choiceTempInfo.name);
      spinner.succeed("pull choice template successed");
      if (Array.isArray(result) && result.length > 0) {
        this._choiceTempDownloadInfo = result;
      } else {
        this.throwError("你选择的模板信息为空");
      }
    } catch (error) {
      spinner.fail("pull choice template fail");
      log.verbose("pull choice template error detail:", err);
    }
  }
  async getTemplateInfo() {
    const { type } = await inquirer.prompt({
      type: "list",
      name: "type",
      message: "请选择项目类型",
      default: "p",
      choices: [
        {
          name: "项目",
          value: "p",
        },
        {
          name: "组件",
          value: "c",
        },
      ],
    });
    if (type === "p") {
      const title = "项目";
      const projectPrompt = [
        {
          type: "input",
          name: "projectVersion",
          message: `请输入项目版本号`,
          default: "1.0.0",
          validate: function (v) {
            const done = this.async();
            setTimeout(function () {
              if (!!!semver.valid(v)) {
                done("请输入合法的版本号");
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            if (!!semver.valid(v)) {
              return semver.valid(v);
            } else {
              return v;
            }
          },
        },
        {
          type: "list",
          name: "projectTemplate",
          message: `请选择项目模板`,
          choices: this._temps.map((temp) => ({
            name: temp.name,
            value: temp,
          })),
        },
      ];
      let projectInfo = { projectName: this.projectName };
      if (!this.projectName) {
        projectPrompt.unshift({
          type: "input",
          name: "projectName",
          message: `请输入项目名称`,
          default: "",
        });
      }
      const result = await inquirer.prompt(projectPrompt);
      projectInfo = {
        ...projectInfo,
        ...result,
        type,
      };

      return projectInfo;
    }
    if (type === "c") {
      return;
    }
  }
  async prepare() {
    //准备阶段 1查看模板是否存在
    try {
      spinner.text = "check the warehouse template";
      spinner.start();
      const temp = await getTemplate();
      spinner.stop();
      if (!temp || temp.length < 1) {
        return this.throwError("暂时没有模板");
      }
      this._temps = temp;
      const cwd = process.cwd();
      this._cwd = cwd;

      const cwdIsEmpty = this.isDirEmpty(cwd);
      if (cwdIsEmpty) {
        const result = await inquirer.prompt({
          type: "confirm",
          name: "ifContinue",
          default: false,
          message: "当前文件夹为空，是否继续创建项目？",
        });
        if (!result.ifContinue) return;
      } else {
        //当前目录存在文件
        if (this.force) {
          //强制删除当前目录的所有文件
          await this.sureDeleteCWD(
            cwd,
            "确定清空当前目录的所有文件吗?",
            "当前目录不是空目录,无法创建你的项目"
          );
        } else {
          await this.sureDeleteCWD(
            cwd,
            "当前目录不为空,是否清空当前目录?",
            "当前目录不是空目录,无法创建你的项目"
          );
        }
      }
    } catch (error) {
      spinner.stop();
      console.log(error.message);
      log.verbose("request template list error:", error.message);
      this.throwError("请求模板发生错误");
    }
  }
  async sureDeleteCWD(cwd, message, errmessage) {
    const result = await inquirer.prompt({
      type: "confirm",
      name: "sureDeleteDir",
      default: false,
      message: message,
    });
    if (result.sureDeleteDir) {
      fsExtra.emptyDirSync(cwd);
    } else {
      log.error("create project error:", errmessage);
      process.exit(0);
    }
  }
  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    // 文件过滤的逻辑
    fileList = fileList.filter(
      (file) => !file.startsWith(".") && ["node_modules"].indexOf(file) < 0
    );
    return !fileList || fileList.length <= 0;
  }
}
function init(argv) {
  return new InitCommand([...argv]);
}
module.exports = init;
