(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('BookingsController', BookingsController);

  BookingsController.$inject = ['$scope', 'bookingResolve', 'Authentication'];

  function BookingsController($scope, booking, Authentication) {
    var vm = this;

    vm.booking = booking;
    vm.authentication = Authentication;

  }
}());
