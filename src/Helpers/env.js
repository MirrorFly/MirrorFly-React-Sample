class Env {
  constructor() {
    this.env = null;
  }

  /**
   * To fetch the env values
   *
   * @return json
   */
  fetchEnv() {
    fetch("/env.json").then(response => response.json()).then((data) => {
      this.env = data;
    });
  }

  /**
   * response parser
   *
   * @return string
   */
  responseParser() {
    return response => {
      let contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
      } else if (
        contentType &&
        (contentType.indexOf("application/pdf") !== -1 ||
          contentType.indexOf("application/csv") !== -1 ||
          contentType.indexOf("text/csv") !== -1 ||
          contentType.indexOf("application/ms-excel") !== -1)
      ) {
        return response.blob();
      } else {
        return response.text();
      }
    };
  }

  /**
   * To set the env values
   *
   * @return json
   */
  setEnv() {
    return this.env;
  }

  /**
   * Get the value based on key
   *
   * @return string
   */
  getEnv(key) {
    let value = this.setEnv();
    return value ? value[key] : "";
  }
}
export default new Env();
