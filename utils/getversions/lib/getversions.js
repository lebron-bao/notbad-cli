"use strict";
const axios = require("axios");
const urlJoin = require("url-join");
const semver = require("semver");
const originRegister = "https://registry.npmjs.org/";

async function getversions(pkgname) {
  try {
    const url = urlJoin(originRegister, pkgname);
    const { data } = await axios.get(url);
    if (!data.versions) return [];
    return Object.keys(data.versions);
  } catch (error) {
    return [];
  }
}
async function getLatestVersion(pkgname) {
  let versions = await getversions(pkgname);
  if (versions.length > 0) {
    return versions.sort((a, b) => (semver.gt(b, a) ? 1 : -1))[0];
  }
  return null;
}

module.exports = { getversions, getLatestVersion };
