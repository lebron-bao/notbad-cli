"use strict";
const Request = require("jiabao-axios");
const { Octokit } = require("octokit");
const baseURL = "https://api.github.com";
const token = "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";
const req = new Request({
  baseURL,
  timeout: 3000,
  headers: { Authorization: `token${token}` },
});
const download = new Request({
  baseURL: "",
  timeout: 5000,
  headers: { Authorization: `token${token}` },
});
// https://api.github.com/repos/lebron-bao/notbad-cli-templates/contents/src
const user = "lebron-bao";
const repositry = "notbad-cli-templates";
const getTemplate = function () {
  const url = `/repos/${user}/${repositry}/contents/src`;
  return req.Get({
    url,
  });
};
const getChoiceTemplateContent = function (tempName) {
  const url = `/repos/lebron-bao/notbad-cli-templates/contents/src/${tempName}`;
  return req.Get({
    url,
  });
};
const getTemplateTypeDir = function (url) {
  url = `/repos/lebron-bao/notbad-cli-templates/contents/${url}`;
  return req.Get({
    url,
  });
};
const downloadFile = function (url) {
  return download.Get({
    url,
  });
};
const getTemplateTimes = function () {
  // Octokit.js
  // https://github.com/octokit/core.js#readme

  const octokit = new Octokit({
    auth: token,
  });
  return octokit.request("GET /rate_limit", {
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
};

module.exports = {
  getTemplateTimes,
  getTemplate,
  getChoiceTemplateContent,
  getTemplateTypeDir,
  downloadFile,
};
