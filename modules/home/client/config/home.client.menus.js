(function () {
  'use strict';

  angular
    .module('home')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'Home',
    //   state: 'dashboard',
    //   roles: ['admin','user']
    // });
  }
}());
