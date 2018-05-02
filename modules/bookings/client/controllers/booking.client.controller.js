(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('BookingsAdminController', BookingsAdminController);

  BookingsAdminController.$inject = ['$scope', '$state', '$window', 'BookingsService', 'Authentication', 'Notification', 'bookingResolve', '$timeout'];

  function BookingsAdminController($scope, $state, $window, booking, Authentication, Notification, bookingResolve, $timeout) {
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
        other_charge: 0,
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
        extra_breakup: [],
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
          payment_mode: "",
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

    vm.addOtherBreakup = function() {
        if(vm.bookingForm.extra_breakup == undefined)
          vm.bookingForm.extra_breakup = [];    
        vm.bookingForm.extra_breakup.push({
            extra_name: "",
            extra_value: 0
        });
    }

    vm.removeOtherBreakup = function(index) {
        vm.bookingForm.extra_breakup.splice(index, 1);
    }

    vm.bookingForm.other_charge = 0;
    vm.onBreakupChange = function() {
        vm.bookingForm.other_charge = 0;
        for(var i=0; i<vm.bookingForm.extra_breakup.length; i++) {
          if(vm.bookingForm.extra_breakup[i] == undefined || vm.bookingForm.extra_breakup[i] == null)
              vm.bookingForm.extra_breakup[i].extra_value = 0;
          vm.bookingForm.other_charge += vm.convertToFloat(vm.bookingForm.extra_breakup[i].extra_value);
        }
    }

    vm.allClients = [];
    vm.clients = [];
    vm.allsClients = [];
    vm.sclients = [];

    $timeout(function () {
      for(var i=0; i<vm.allBookings.length; i++) {
        var isFound = false;
        for(var j=0; j<vm.allClients.length; j++) {
          if(vm.allClients[j].name.toUpperCase() == vm.allBookings[i].consignor.name.toUpperCase()) isFound = true;
        }
        if(!isFound) vm.allClients.push(vm.allBookings[i].consignor);
        var issFound = false;
        for(var j=0; j<vm.allsClients.length; j++) {
          if(vm.allsClients[j].name.toUpperCase() == vm.allBookings[i].consignee.name.toUpperCase()) isFound = true;
        }
        if(!isFound) vm.allsClients.push(vm.allBookings[i].consignee);
      }
    }, 500);

    vm.complete = function(selectedClient) {
      vm.clientbookings = [];
			var output=[];
			angular.forEach(vm.allClients,function(clts){
				if(clts.name.toLowerCase().indexOf(selectedClient.toLowerCase())>=0){
					output.push(clts);
				}
			});
			vm.clients=output;
    }
    
		vm.fillTextbox=function(string){
			vm.bookingForm.consignor.name=string.name;
      vm.bookingForm.consignor.address=string.address;
      vm.bookingForm.consignor.phonenum=string.phonenum;
      vm.bookingForm.consignor.gstin_no=string.gstin_no;
      vm.bookingForm.consignor.pan_no=string.pan_no;
      vm.bookingForm.consignor.state=string.state;
      vm.bookingForm.consignor.state_code=string.state_code;
      vm.clients=[];
    }

    vm.scomplete = function(selectedClient) {
      vm.clientbookings = [];
			var output=[];
			angular.forEach(vm.allsClients,function(clts){
				if(clts.name.toLowerCase().indexOf(selectedClient.toLowerCase())>=0){
					output.push(clts);
				}
			});
			vm.sclients=output;
    }
    
		vm.sfillTextbox=function(string){
			vm.bookingForm.consignee.name=string.name;
      vm.bookingForm.consignee.address=string.address;
      vm.bookingForm.consignee.phonenum=string.phonenum;
      vm.bookingForm.consignee.gstin_no=string.gstin_no;
      vm.bookingForm.consignee.pan_no=string.pan_no;
      vm.bookingForm.consignee.state=string.state;
      vm.bookingForm.consignee.state_code=string.state_code;
      vm.sclients=[];
    }

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

  }
}());
