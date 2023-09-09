const packageManager = require("./package.js");
const { getLatestVersion } = require("@notbad-cli/getversions");
const pathExists = require("path-exists").sync;
const fsExtra = require("fs-extra");
const path = require("path");
const npmInstall = require("npminstall");
const pkgDir = require("pkg-dir").sync;
const log = require("@notbad-cli/log");
class OriginPackage extends packageManager {
  cachePath = undefined;
  latestVersion = undefined;
  constructor(options) {
    super(options);
    this.init(options);
  }
  init(options) {
    this.homePath = options.homePath;
    this.cachePath = options.cachePath;
    this.storePath = options.cachePath + "/node_modules";
    this.cacheFilePathPrefix = `_${options.pkgName.replace("/", "_")}`;
    if (!this.homePathIsExist) {
      fsExtra.mkdirSync(this.homePath);
    }
    if (!this.cachePathIsExist) {
      fsExtra.mkdirSync(this.cachePath, { recursive: true });
    }
  }
  async getLatestPackageVersion() {
    try {
      const latest = await getLatestVersion(this.pkgName);
      if (latest) return latest;
      return null;
    } catch (error) {
      return null;
    }
  }
  async isLatestVersion() {
    if (this.pkgVersion === "latest") {
      this.pkgVersion = await this.getLatestPackageVersion();
    }
  }
  async install() {
    await this.isLatestVersion();
    if (this.isExist(this.cacheFilePath)) {
      log.verbose("originPackage", `${this.pkgName} use a local cache`);
    } else {
      await this._installPkg();
    }
  }
  async _installPkg() {
    await npmInstall({
      root: this.cachePath,
      storeDir: this.storePath,
      registry: "https://registry.npmjs.org/",
      pkgs: [
        {
          name: this.pkgName,
          version: this.pkgVersion,
        },
      ],
    });
  }

  get cacheFilePath() {
    return path.resolve(
      this.storePath,
      `${this.cacheFilePathPrefix}@${this.pkgVersion}@${this.pkgName}`
    );
  }
  get homePathIsExist() {
    if (this.homePath) {
      return this.isExist(this.homePath);
    }
    return false;
  }
  get cachePathIsExist() {
    if (this.cachePath) {
      return this.isExist(this.cachePath);
    }
    return false;
  }
  isExist(path) {
    return pathExists(path);
  }
  async getPkgEntryFile() {
    const dir = pkgDir(this.cacheFilePath);
    if (dir) {
      const pkgPath = path.resolve(dir, "package.json");
      const pkgContent = require(pkgPath);
      if (pkgContent.main) {
        const entry = path.resolve(dir, pkgContent.main);
        if (this.isExist(entry)) {
          return entry.replaceAll(/\\/g, "/");
        } else {
          return null;
        }
      }
    } else {
      return null;
    }
  }
}

module.exports = OriginPackage;
