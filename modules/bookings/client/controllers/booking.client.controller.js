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
          phonenum: "",
          gstin_no: "",
          pan_no: "",
          state: "",
          state_code: ""
        },
        consignee: {
          name: "",
          address: "",
          phonenum: "",
          gstin_no: "",
          pan_no: "",
          state: "",
          state_code: ""
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
        },
        bank: "",
        show_vehicle_no: false,
        clearances: []
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

    vm.reset();

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
      var total = vm.convertToFloat(vm.bookingForm.commission) + vm.convertToFloat(vm.bookingForm.extra)
           + vm.convertToFloat(vm.bookingForm.interest) + vm.convertToFloat(vm.bookingForm.crane_charge)
           + vm.convertToFloat(vm.bookingForm.halting) + vm.convertToFloat(vm.bookingForm.hire);
      if(total == 0) {
        vm.advance_perc = 0;  
      } else {
        vm.advance_perc = (vm.convertToFloat(vm.bookingForm.advance) * 100 / total).toFixed(2);
      }
    }

    vm.onAdvancePercChange = function() {
      var total = vm.convertToFloat(vm.bookingForm.commission) + vm.convertToFloat(vm.bookingForm.extra)
           + vm.convertToFloat(vm.bookingForm.interest) + vm.convertToFloat(vm.bookingForm.crane_charge)
           + vm.convertToFloat(vm.bookingForm.halting) + vm.convertToFloat(vm.bookingForm.hire);
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

    vm.onBankChange = function(name) {
        vm.bookingForm.bank = name;
    }
    vm.onBankChange("axis");

    vm.onShowVehicleNoChange = function(bl) {
        vm.bookingForm.show_vehicle_no = bl;
    }
    vm.onShowVehicleNoChange(false);

    if($state.params.bookingId) {
      vm.bookingForm = {
        _id: bookingResolve[0]._id,
        lr_date: bookingResolve[0].lr_date,
        lr_number: bookingResolve[0].lr_number,
        challan_number: bookingResolve[0].challan_number,
        branch_area: bookingResolve[0].branch_area,
        from: bookingResolve[0].from,
        to: bookingResolve[0].to,
        package: bookingResolve[0].package,
        weight: bookingResolve[0].weight,
        consignor: bookingResolve[0].consignor,
        consignee: bookingResolve[0].consignee,
        invoice_number: bookingResolve[0].invoice_number,
        invoice_date: bookingResolve[0].invoice_date,
        basic_amount: bookingResolve[0].basic_amount,
        service_tax: bookingResolve[0].service_tax,
        other_charge: bookingResolve[0].other_charge,
        booking_method: bookingResolve[0].booking_method,
        vehicle_number: bookingResolve[0].vehicle_number,
        vehicle_type: bookingResolve[0].vehicle_type,
        vehicle_owner_broker_name: bookingResolve[0].vehicle_owner_broker_name,
        commission: bookingResolve[0].commission,
        interest: bookingResolve[0].interest,
        extra: bookingResolve[0].extra,
        crane_charge: bookingResolve[0].crane_charge,
        halting: bookingResolve[0].halting,
        hire: bookingResolve[0].hire,
        advance: bookingResolve[0].advance,
        payments: bookingResolve[0].payments,
        balance: bookingResolve[0].balance,
        payments_cleared: bookingResolve[0].payments_cleared,
        balance_cleared: bookingResolve[0].balance_cleared,
        pod: bookingResolve[0].pod,
        remarks: bookingResolve[0].remarks,
        driver: bookingResolve[0].driver,
        bank: bookingResolve[0].bank,
        show_vehicle_no: bookingResolve[0].show_vehicle_no,
        clearances: bookingResolve[0].clearances
      };
    }

    console.log(vm.bookingForm);

  }
}());
