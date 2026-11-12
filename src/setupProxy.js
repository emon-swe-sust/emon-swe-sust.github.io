// Create React App loads this file automatically, and only in the development
// server (`npm start`). It is not bundled into `npm run build`, so the deployed
// site has no admin API.
const path = require("path");
const { mountAdminApi } = require("../scripts/admin-api");

module.exports = function setupAdmin(app) {
  mountAdminApi(app, { root: path.resolve(__dirname, "..") });
};
