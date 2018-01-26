(function () {
  'use strict';

  angular
    .module('users.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  // Configuring the Users module
  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Users',
      state: 'admin.users',
      roles: ['admin']
    });
  }
}());
