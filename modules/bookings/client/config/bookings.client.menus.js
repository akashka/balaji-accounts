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

    menuService.addMenuItem('topbar', {
      title: 'Cheques',
      state: 'bookings.cheque',
      roles: ['admin','user']
    });

    menuService.addMenuItem('topbar', {
      title: 'Payments',
      state: 'bookings.payments',
      roles: ['admin','user']
    });

  }
}());
