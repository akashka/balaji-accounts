(function () {
  'use strict';

  angular
    .module('home.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('dashboard', {
        url: '/',
        templateUrl: '/modules/home/client/views/home.client.view.html',
        controller: 'HomeController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin']
        }
      })
  }

}());
