(function (app) {
  'use strict';

  app.registerModule('bookings', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('bookings.admin', ['core.admin']);
  app.registerModule('bookings.admin.routes', ['core.admin.routes']);
  app.registerModule('bookings.services');
  app.registerModule('bookings.routes', ['ui.router', 'core.routes', 'bookings.services']);
}(ApplicationConfiguration));
