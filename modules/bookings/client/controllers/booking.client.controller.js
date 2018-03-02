(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('BookingsAdminController', BookingsAdminController);

  BookingsAdminController.$inject = ['$scope', '$state', '$window', 'BookingsService', 'Authentication', 'Notification', 'bookingResolve'];

  function BookingsAdminController($scope, $state, $window, booking, Authentication, Notification, bookingResolve) {
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
    vm.save = function(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.bookingForm');
        return false;
      }

      // Create a new booking, or update the current instance
      booking.createOrUpdate(vm.bookingForm)
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

    vm.reset = function() {
      
      vm.bookingForm = {
        _id: null,
        lr_date: "",
        lr_number: "",
        challan_number: "",
        branch_area: "",
        from: "",
        to: "",
        package: "",
        weight: "",
        consignor: {
          name: "",
          address: "",
          phonenum: ""
        },
        consignee: {
          name: "",
          address: "",
          phonenum: ""
        },
        invoice_number: "",
        invoice_date: "",
        basic_amount: "",
        service_tax: "",
        other_charge: "",
        booking_method: "",
        vehicle_number: "",
        vehicle_type: "",
        vehicle_owner_broker_name: {
          name: "",
          address: "",
          phonenum: ""
        },
        commission: "",
        interest: "",
        extra: "",
        crane_charge: "",
        halting: "",
        hire: "",
        advance: "",
        payments: {
          payment_mode: "",
          cheque_no: "",
          cheque_date: ""
        },
        balance: {
          payment_mode: "cheque",
          cheque_no: "",
          cheque_date: ""
        },
        payments_cleared: "",
        balance_cleared: "",
        pod: {
          receipt: "",
          received: "",
          bill_no: "",
          customer_submitted: false,
          gmr: ""
        },
        remarks: "",
        driver: {
          name: "",
          numb: ""
        }
      };

      vm.bookingForm.payments.amount = vm.bookingForm.advance;
      vm.bookingForm.balance.amount = (vm.convertToFloat(vm.bookingForm.advance) - vm.convertToFloat(vm.bookingForm.basic_amount) - 
                                vm.convertToFloat(vm.bookingForm.service_tax) - vm.convertToFloat(vm.bookingForm.other_charge));
      
      vm.dateset = {
        lr_date: {
          isOpened: false
        }
      };

      vm.isError = false;
      vm.requestSubmitted = false;
      vm.bookingCompleted = false;
    
    };

    if($state.params.bookingId) {
      vm.bookingForm = bookingResolve[0];
    } else {
      vm.reset();
    }

    vm.gotoNewBooking = function() {
         vm.reset();         
    };

    vm.selectDate = function($event, num) {
      if(num == 1) { vm.dateset.lr_date.isOpened = true; }
      if(num == 2) { vm.dateset.invoice_date.isOpened = true; }
      if(num == 3) { vm.dateset.cheque_date.isOpened = true; }
      if(num == 4) { vm.dateset.balance_cheque_date.isOpened = true; }
      if(num == 5) { vm.dateset.pod_receipt.isOpened = true; }
      if(num == 6) { vm.dateset.pod_received.isOpened = true; }
    };

    vm.onAdvanceChange = function() {
      var total = vm.convertToFloat(vm.bookingForm.basic_amount) 
        + vm.convertToFloat(vm.bookingForm.service_tax) + vm.convertToFloat(vm.bookingForm.other_charge);
      if(total == 0) {
        vm.advance_perc = 0;  
      } else {
        vm.advance_perc = (vm.convertToFloat(vm.bookingForm.advance) * 100 / total).toFixed(2);
      }
    }

    vm.onAdvancePercChange = function() {
      var total = vm.convertToFloat(vm.bookingForm.basic_amount) 
        + vm.convertToFloat(vm.bookingForm.service_tax) + vm.convertToFloat(vm.bookingForm.other_charge);
      vm.bookingForm.advance = (vm.convertToFloat(vm.advance_perc) / 100 * total).toFixed(2);
    }

    vm.onTotalChange = function() {
      vm.bookingForm.advance = 0;
      vm.advance_perc = 0;
    }

    vm.dateOptions = {
      formatYear: 'yy',
      maxDate: new Date(2020, 5, 22),
      minDate: new Date(),
      startingDay: 1
    };

    vm.dateset.lr_date = { isOpened: false };
    vm.dateset.invoice_date = { isOpened: false };
    vm.dateset.cheque_date = { isOpened: false };
    vm.dateset.balance_cheque_date = { isOpened: false };
    vm.dateset.pod_receipt = { isOpened: false };
    vm.dateset.pod_received = { isOpened: false };

    vm.duplicateLrNumber = false;
    vm.onLrNumberChange = function() {
      vm.duplicateLrNumber = false;
      for(var a = 0; a < vm.allBookings.length; a++) {
        if(vm.allBookings[a].lr_number == vm.bookingForm.lr_number) vm.duplicateLrNumber = true;
      }
    }

    vm.duplicateChallanNumber = false;
    vm.onChallanNumberChange = function() {
      vm.duplicateChallanNumber = false;
      for(var a = 0; a < vm.allBookings.length; a++) {
        if(vm.allBookings[a].challan_number == vm.bookingForm.challan_number) vm.duplicateChallanNumber = true;
      }
    }    

  }
}());
