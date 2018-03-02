(function () {
  'use strict';

  angular
    .module('bookings.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('bookings', {
        abstract: true,
        url: '/bookings',
        template: '<ui-view/>'
      })
      .state('bookings.list', {
        url: '',
        templateUrl: '/modules/bookings/client/views/list-bookings.client.view.html',
        controller: 'BookingsListController',
        controllerAs: 'vm'
      })
      .state('bookings.cheque', {
        url: '/cheques',
        templateUrl: '/modules/bookings/client/views/list-cheques.client.view.html',
        controller: 'ChequesListController',
        controllerAs: 'vm'
      })
      .state('bookings.create', {
        url: '/create',
        templateUrl: '/modules/bookings/client/views/create-booking.client.view.html',
        controller: 'BookingsAdminController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Create Booking'
        },
        resolve: {
          bookingResolve: newBooking
        }
      })
      .state('bookings.edit', {
        url: '/:bookingId/edit',
        templateUrl: '/modules/bookings/client/views/create-booking.client.view.html',
        controller: 'BookingsAdminController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Edit Booking'
        },
        resolve: {
          bookingResolve: getBooking
        }
      })
      .state('bookings.view', {
        url: '/:bookingId',
        templateUrl: '/modules/bookings/client/views/view-booking.client.view.html',
        controller: 'BookingsController',
        controllerAs: 'vm',
        resolve: {
          bookingResolve: getBooking
        },
        data: {
          pageTitle: 'View Booking'
        }
      });
  }

  getBooking.$inject = ['$stateParams', 'BookingsService'];

  function getBooking($stateParams, BookingsService) {
    return BookingsService.query(
      {isArray: true}
    ).$promise;
  }

  newBooking.$inject = ['BookingsService'];

  function newBooking(BookingsService) {
    return new BookingsService();
  }

}());
