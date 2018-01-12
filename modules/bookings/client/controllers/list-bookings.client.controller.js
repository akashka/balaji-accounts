(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('BookingsListController', BookingsListController);

  BookingsListController.$inject = ['BookingsService'];

  function BookingsListController(BookingsService) {
    var vm = this;

    vm.bookings = BookingsService.query();
  }
}());
