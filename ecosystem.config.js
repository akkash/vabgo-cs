module.exports = {
  apps: [{
    name: "vabgo-cs-static-server",
    script: "npx",
    args: "serve out",
    env: {
      PM2_SERVE_PATH: "out",
      PM2_SERVE_PORT: 3000,
      PM2_SERVE_SPA: "true",
      PM2_SERVE_HOMEPAGE: "/index.html"
    }
  }]
}
