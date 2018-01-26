(function () {
  'use strict';

  angular
    .module('bookings')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Bookings',
      state: 'bookings.list',
      roles: ['admin','user']
    });

    menuService.addMenuItem('topbar', {
      title: 'New Booking',
      state: 'bookings.create',
      roles: ['admin','user']
    });

  }
}());
