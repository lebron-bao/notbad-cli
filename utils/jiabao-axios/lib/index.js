const axios = require("./axios/index.js");
const fetch = require("./fetch/index.js");
const libs = {
  axios: axios,
  fetch: fetch,
};
class Request {
  static lib = "axios";
  constructor(options) {
    const Lib = libs[Request.lib];
    this._options = options;
    this._req = new Lib(options);
    this.interceptors = {
      request: [],
      response: [],
    };
    this.addInterceptor(options.interceptors);
  }
  addInterceptor(option) {
    if (!option) return;
    //添加拦截器
    this.interceptors.request.push(option.request);
    this.interceptors.response.push(option.response);
    this._req.interceptors.request.push(option.request);
    this._req.interceptors.response.push(option.response);
  }
  async Get(options) {
    return await this._req.Get(options);
  }
  async Post(options) {
    return await this._req.Post(options);
  }
  async Delete(options) {
    return await this._req.Delete(options);
  }
  async Patch(options) {
    return await this._req.Patch(options);
  }
}

module.exports = Request;
