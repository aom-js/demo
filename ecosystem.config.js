// PM2 startup script
const env = require("dotenv").config();

const { NODE_ENV } = process.env;

const defaults = {
  merge_logs: NODE_ENV !== "development",
  log_date_format: "MM/DD/YYYY HH:mm:ss",
  env: {
    NODE_ENV,
    NODE_PATH: "./build/src",
    ...env.parsed,
  },
};

module.exports = {
  apps: [
    {
      name: "meta-init",
      out_file: "/tmp/demo-init.log",
      script: "build/src/init.js",
      ...defaults,
    },
    {
      name: "demo-auth-api",
      out_file: "/tmp/demo-auth-api.log",
      script: "build/src/api/auth/index.js",
      ...defaults,
    },
    {
      name: "demo-admin-api",
      out_file: "/tmp/demo-admin-api.log",
      script: "build/src/api/admin/index.js",
      ...defaults,
    },
    {
      name: "demo-files-api",
      out_file: "/tmp/demo-files-api.log",
      script: "build/src/api/files/index.js",
      ...defaults,
    },
    {
      name: "kafka-services",
      out_file: "/tmp/demo-kafka-services.log",
      script: "build/scripts/kafka-services.js",
      ...defaults,
    },
  ],
};
