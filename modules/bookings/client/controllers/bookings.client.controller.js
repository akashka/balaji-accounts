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

    vm.calculateTotal = function(booking) {
        var total = 0;
        if(booking.basic_amount != "") total += vm.convertToFloat(booking.basic_amount);
        if(booking.service_tax != "") total += vm.convertToFloat(booking.service_tax);
        for(var e=0; e<booking.extra_breakup.length; e++) {
          if(booking.extra_breakup[e].extra_value != "") total += vm.convertToFloat(booking.extra_breakup[e].extra_value);
        }
        return total;
    }

    vm.calculatePayable = function(booking) {
        var total = 0;
        if(booking.commission != "") total += vm.convertToFloat(booking.commission);
        if(booking.interest != "") total += vm.convertToFloat(booking.interest);
        if(booking.extra != "") total += vm.convertToFloat(booking.extra);
        if(booking.crane_charge != "") total += vm.convertToFloat(booking.crane_charge);
        if(booking.halting != "") total += vm.convertToFloat(booking.halting);
        if(booking.hire != "") total += vm.convertToFloat(booking.hire);
        return total;
    }

  }
}());
