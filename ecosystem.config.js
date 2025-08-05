module.exports = {
    apps: [{
      name: "migii-hsk-api",
      script: "/app/dist/main.js",
      node_args: "-r newrelic",
      env: {
        NEW_RELIC_APP_NAME: "migii-hsk",
        NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY || ""
      }
    }]
  }