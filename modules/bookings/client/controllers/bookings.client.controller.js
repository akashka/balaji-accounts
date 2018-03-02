(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('BookingsController', BookingsController);

  BookingsController.$inject = ['$scope', 'BookingsService', 'Authentication', 'BookingsService', 'bookingResolve', '$state'];

  function BookingsController($scope, booking, Authentication, BookingsService, bookingResolve, $state) {
    var vm = this;

    vm.booking = booking;
    vm.authentication = Authentication;
    var bid = $state.params.bookingId;
    for(var i = 0; i < bookingResolve.length; i++) {
      if(bookingResolve[i]._id == bid)
        vm.bookingForm = bookingResolve[i];
    }

    vm.edit = function() {

    }

    vm.gotoNewBooking = function() {

    }

    vm.convertToFloat = function(stri) {
      if(stri == null || stri == undefined) return 0;
      return parseFloat(stri);
    }

  }
}());
