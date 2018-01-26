(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('BookingsAdminController', BookingsAdminController);

  BookingsAdminController.$inject = ['$scope', '$state', '$window', 'BookingsService', 'Authentication', 'Notification'];

  function BookingsAdminController($scope, $state, $window, booking, Authentication, Notification) {
    var vm = this;
    vm.authentication = Authentication;
    vm.bookings = angular.toJson(booking);

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
      }s
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

    vm.reset();
    if($state.params.bookingId) {
      for(var i = 0; i < vm.bookings.length; i++){
        if($state.params.bookingId == vm.bookings[i]._id) vm.bookingForm = vm.bookings[i];
      }
    }

    vm.gotoNewBooking = function() {
         vm.reset();         
    };

    vm.selectDate = function($event, num) {

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

  }
}());
