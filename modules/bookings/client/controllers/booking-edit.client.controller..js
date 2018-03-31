(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('BookingsAdminEditController', BookingsAdminEditController);

  BookingsAdminEditController.$inject = ['$scope', '$state', '$window', 'BookingsService', 'Authentication', 'Notification', 'bookingResolve'];

  function BookingsAdminEditController($scope, $state, $window, booking, Authentication, Notification, bookingResolve) {
    var vm = this;
    vm.authentication = Authentication;
    vm.bookings = angular.toJson(booking);
    vm.allBookings = booking.query();

    vm.convertToFloat = function(stri) {
      if(stri == null || stri == undefined) return 0;
      return parseFloat(stri);
    }

    // Remove existing Booking
    vm.remove = function() {
      if ($window.confirm('Are you sure you want to delete?')) {
        booking.$remove(function () {
          $state.go('admin.bookings.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Booking deleted successfully!' });
        });
      }
    }

    // Save Bookiing
    vm.save = function() {
      // Create a new booking, or update the current instance
      booking.createOrUpdate(vm.booking)
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('bookings.list');
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Booking saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Booking save error!' });
      }
    }

    vm.isError = false;
    vm.requestSubmitted = false;
    vm.bookingCompleted = false;
    
    vm.selectDate = function($event, num) {
      if(num == 1) { vm.dateset.lr_date.isOpened = true; }
      if(num == 2) { vm.dateset.invoice_date.isOpened = true; }
      if(num == 3) { vm.dateset.cheque_date.isOpened = true; }
      if(num == 4) { vm.dateset.balance_cheque_date.isOpened = true; }
      if(num == 5) { vm.dateset.pod_receipt.isOpened = true; }
      if(num == 6) { vm.dateset.pod_received.isOpened = true; }
    };

    vm.onAdvanceChange = function() {
      var total = vm.convertToFloat(vm.booking.commission) + vm.convertToFloat(vm.booking.extra)
           + vm.convertToFloat(vm.booking.interest) + vm.convertToFloat(vm.booking.crane_charge)
           + vm.convertToFloat(vm.booking.halting) + vm.convertToFloat(vm.booking.hire);
      if(total == 0) {
        vm.advance_perc = 0;  
      } else {
        vm.advance_perc = (vm.convertToFloat(vm.booking.advance) * 100 / total).toFixed(2);
      }
    }

    vm.onAdvancePercChange = function() {
      var total = vm.convertToFloat(vm.booking.commission) + vm.convertToFloat(vm.booking.extra)
           + vm.convertToFloat(vm.booking.interest) + vm.convertToFloat(vm.booking.crane_charge)
           + vm.convertToFloat(vm.booking.halting) + vm.convertToFloat(vm.booking.hire);
      vm.booking.advance = (vm.convertToFloat(vm.advance_perc) / 100 * total).toFixed(2);
    }

    vm.onTotalChange = function() {
      vm.booking.advance = 0;
      vm.advance_perc = 0;
    }

    vm.dateOptions = {
      formatYear: 'yy',
      maxDate: new Date(2030, 5, 22),
      minDate: new Date(1920, 5, 22),
      startingDay: 1
    };

    vm.dateset = {
      lr_date: { isOpened: false },
      invoice_date: { isOpened: false },
      cheque_date: { isOpened: false },
      balance_cheque_date: { isOpened: false },
      pod_receipt: { isOpened: false },
      pod_received: { isOpened: false }
    };

    vm.duplicateLrNumber = false;
    vm.onLrNumberChange = function() {
      vm.duplicateLrNumber = false;
      for(var a = 0; a < vm.allBookings.length; a++) {
        if(vm.allBookings[a].lr_number == vm.booking.lr_number) vm.duplicateLrNumber = true;
      }
    }

    vm.duplicateChallanNumber = false;
    vm.onChallanNumberChange = function() {
      vm.duplicateChallanNumber = false;
      for(var a = 0; a < vm.allBookings.length; a++) {
        if(vm.allBookings[a].challan_number == vm.booking.challan_number) vm.duplicateChallanNumber = true;
      }
    }    

    vm.onBankChange = function(name) {
        vm.booking.bank = name;
    }

    vm.onShowVehicleNoChange = function(bl) {
        vm.booking.show_vehicle_no = bl;
    }

    vm.addOtherBreakup = function() {
        if(vm.booking.extra_breakup == undefined)
          vm.booking.extra_breakup = [];    
        vm.booking.extra_breakup.push({
            extra_name: "",
            extra_value: 0
        });
    }

    vm.removeOtherBreakup = function(index) {
        vm.booking.extra_breakup.splice(index, 1);
    }

    vm.onBreakupChange = function() {
        vm.booking.other_charge = 0;
        for(var i=0; i<vm.booking.extra_breakup.length; i++) {
          if(vm.booking.extra_breakup[i] == undefined || vm.booking.extra_breakup[i] == null)
              vm.booking.extra_breakup[i].extra_value = 0;
          vm.booking.other_charge += vm.convertToFloat(vm.booking.extra_breakup[i].extra_value);
        }
    }

    for(var k=0; k<bookingResolve.length; k++) {
      if(bookingResolve[k]._id == $state.params.bookingId) {
          vm.booking = {
            _id: bookingResolve[k]._id,
            lr_date: new Date(bookingResolve[k].lr_date),
            lr_number: bookingResolve[k].lr_number,
            challan_number: bookingResolve[k].challan_number,
            branch_area: bookingResolve[k].branch_area,
            from: bookingResolve[k].from,
            to: bookingResolve[k].to,
            package: bookingResolve[k].package,
            weight: bookingResolve[k].weight,
            consignor: bookingResolve[k].consignor,
            consignee: bookingResolve[k].consignee,
            invoice_number: bookingResolve[k].invoice_number,
            invoice_date: new Date(bookingResolve[k].invoice_date),
            basic_amount: bookingResolve[k].basic_amount,
            service_tax: bookingResolve[k].service_tax,
            other_charge: bookingResolve[k].other_charge,
            booking_method: bookingResolve[k].booking_method,
            vehicle_number: bookingResolve[k].vehicle_number,
            vehicle_type: bookingResolve[k].vehicle_type,
            vehicle_owner_broker_name: bookingResolve[k].vehicle_owner_broker_name,
            commission: bookingResolve[k].commission,
            interest: bookingResolve[k].interest,
            extra: bookingResolve[k].extra,
            extra_breakup: bookingResolve[k].extra_breakup,
            crane_charge: bookingResolve[k].crane_charge,
            halting: bookingResolve[k].halting,
            hire: bookingResolve[k].hire,
            advance: bookingResolve[k].advance,
            payments: {
              payment_mode: bookingResolve[k].payments.payment_mode,
              cheque_no: bookingResolve[k].payments.cheque_no,
              cheque_date: new Date(bookingResolve[k].payments.cheque_date)
            },
            balance: {
              payment_mode: bookingResolve[k].balance.payment_mode,
              cheque_no: bookingResolve[k].balance.cheque_no,
              cheque_date: new Date(bookingResolve[k].balance.cheque_date)
            },
            payments_cleared: bookingResolve[k].payments_cleared,
            balance_cleared: bookingResolve[k].balance_cleared,
            pod: {
              receipt: new Date(bookingResolve[k].pod.receipt),
              received: new Date(bookingResolve[k].pod.received),
              bill_no: bookingResolve[k].pod.bill_no,
              customer_submitted: bookingResolve[k].pod.customer_submitted,
              gmr: bookingResolve[k].pod.gmr
            },
            remarks: bookingResolve[k].remarks,
            driver: bookingResolve[k].driver,
            bank: bookingResolve[k].bank,
            show_vehicle_no: bookingResolve[k].show_vehicle_no,
            clearances: bookingResolve[k].clearances
          };
      }
    }

    vm.booking.payments.amount = vm.booking.advance;
    vm.booking.balance.amount = (vm.convertToFloat(vm.booking.advance) - vm.convertToFloat(vm.booking.basic_amount) - 
              vm.convertToFloat(vm.booking.service_tax) - vm.convertToFloat(vm.booking.other_charge));
    vm.onAdvanceChange();
    vm.onBreakupChange();
  }
}());
