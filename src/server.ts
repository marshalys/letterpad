/**
 * Welcome to Letterpad!
 *
 * This is the initial file which is responsible to bootup the client and the admin-dashboard.
 *
 */
import express from 'express';
import { AddressInfo } from 'net';

import adminServer from './admin/server';
import apiServer from './api/server';
import clientServerRendering from './client/server/serverRendering';
import middlewares from './middlewares';
import staticPaths from './staticPaths';

const env = require("node-env-file");
try {
  configureEnvironment();
} catch (e) {
  throw Error(
    "The `.env` does not exist. Did you forget to rename `.env.sample` to `.env` ?",
  );
}
const noop = () => undefined;
require.extensions[".css"] = noop;
require.extensions[".svg"] = noop;

const app = express();
middlewares(app);
// Take care of static assets.
staticPaths(app);

if (process.env.NODE_ENV === "production") {
  apiServer(app);
}
adminServer(app);
clientServerRendering(app);

const server = app.listen(parseInt(process.env.APP_PORT || '4040'), process.env.APP_HOST || '127,0,0,1', function() {
  const addressInfo = server.address() as AddressInfo;
  const host = addressInfo.address;
  const port = addressInfo.port;
  console.log("Letterpad listening at http://%s:%s", host, port);
});

module.exports = server;

function configureEnvironment() {
  env(__dirname + "/../.env");
  // Heroku automatically starts the node server with the port defined
  // in the environment variable.
  if (process.env.NODE_HOME === "/app/.heroku/node") {
    process.env.APP_PORT = process.env.PORT;
  }
}
