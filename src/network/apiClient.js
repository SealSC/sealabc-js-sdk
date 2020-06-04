async function commonPost(httpReq, url, data) {
  return httpReq.post(url, data)
    .then(r => {
      return {
        success: true,
        data: r.data,
      }
    })
    .catch(e => {
      return {
        success: false,
        data: null,
        err: e
      }
    })
}

class ApiClient {
  constructor(config) {
    this.httpRequester = config.httpRequester
    this.apiBaseUrl = config.apiBaseUrl
  }

  async callApplication(data) {
    return commonPost(this.httpRequester,  `${this.apiBaseUrl}/call/application`, data)
  }

  async queryApplication(app, data) {
    return commonPost(this.httpRequester, `${this.apiBaseUrl}/query/application/${app}`, data)
  }
}

export {
  ApiClient
}
