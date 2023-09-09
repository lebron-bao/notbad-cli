const axios = require("axios");

class MyAxios {
  constructor(options) {
    this.init(options);
  }
  abort() {}
  again() {}
  init(options) {
    this._options = options;
    this._req = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout,
    });
    this.interceptors = {
      request: [],
      response: [],
    };
    //默认拦截器
    this._req.interceptors.response.use(
      (res) => {
        return res.data;
      },
      (err) => Promise.reject(err)
    );
  }
  Get(option) {
    return this._req({
      method: "get",
      ...option,
    });
  }
  Post(option) {
    return this._req({
      method: "post",
      ...option,
    });
  }
  async Delete() {}
  async Patch() {}
}

module.exports = MyAxios;
