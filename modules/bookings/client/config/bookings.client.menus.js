(function () {
  'use strict';

  angular
    .module('bookings')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Bookings',
      state: 'bookings',
      type: 'dropdown',
      roles: ['admin','user']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'bookings', {
      title: 'List Bookings',
      state: 'bookings.list',
      roles: ['admin','user']
    });

    menuService.addSubMenuItem('topbar', 'bookings', {
      title: 'Create Booking',
      state: 'bookings.create',
      roles: ['admin','user']
    });

  }
}());
