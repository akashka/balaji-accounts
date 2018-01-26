(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('BookingsController', BookingsController);

  BookingsController.$inject = ['$scope', 'BookingsService', 'Authentication'];

  function BookingsController($scope, booking, Authentication) {
    var vm = this;

    vm.booking = booking;
    vm.authentication = Authentication;

    vm.edit = function() {

    }

    vm.gotoNewBooking = function() {

    }

    vm.convertToFloat = function() {

    }

  }
}());
