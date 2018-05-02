(function (app) {
  'use strict';

  app.registerModule('home', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('home.admin', ['home.admin']);
  app.registerModule('home.admin.routes', ['core.admin.routes']);
  app.registerModule('home.routes', ['ui.router', 'core.routes']);
}(ApplicationConfiguration));
