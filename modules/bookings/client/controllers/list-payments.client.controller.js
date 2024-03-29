(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('PaymentsListController', PaymentsListController);

  PaymentsListController.$inject = ['BookingsService', 'Notification', '$state', '$window', '$timeout', '$scope'];

  function PaymentsListController(BookingsService, Notification, $state, $window, $timeout, $scope) {
    var vm = this;

    vm.bookings = BookingsService.query();
    $timeout(function () {
      for(var v=0; v<vm.bookings.length; v++) {
        vm.bookings[v].sumOfClearances = 0;
        for(var i=0; i<vm.bookings[v].clearances.length; i++) {
          vm.bookings[v].sumOfClearances += vm.convertToFloat(vm.bookings[v].clearances[i].amount_paid);
        }
      }
    }, 500);

    vm.buildPager = function() {
      vm.pagedItems = [];
      vm.itemsPerPage = 15;
      vm.currentPage = 1;
      vm.figureOutItemsToDisplay();
    }
    
    vm.figureOutItemsToDisplay = function() {
      vm.filteredItems = vm.bookings;
      vm.filterLength = vm.filteredItems.length;
      var begin = ((vm.currentPage - 1) * vm.itemsPerPage);
      var end = begin + vm.itemsPerPage;
      vm.pagedItems = vm.filteredItems.slice(begin, end);
    }

    vm.pageChanged = function() {
      vm.figureOutItemsToDisplay();
    }
    vm.buildPager();

    vm.convertToFloat = function(stri) {
      if(stri == null || stri == undefined) return 0;
      return parseFloat(stri);
    }

    vm.remove = function() {
      if ($window.confirm('Are you sure you want to delete?')) {
        booking.$remove(function () {
          $state.go('admin.bookings.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Booking deleted successfully!' });
        });
      }
    }

    vm.onPaymentDone = function(bookingid) {
      vm.toggleDialog();
      for(var i = 0; i < vm.bookings.length; i++) {
        if(vm.bookings[i]._id == bookingid) vm.paymentForm = vm.bookings[i];
      }
    }

    vm.showModal = false;
    vm.toggleDialog = function () {
        vm.showModal = !vm.showModal;
    }

    vm.paymentForm = {};
    vm.dateset = {
        paid: {
          isOpened: false
        }
    };

    vm.selectDate = function($event, num) {
      if(num == 1) { vm.dateset.paid.isOpened = true; }
    };

    vm.dateOptions = {
      formatYear: 'yy',
      maxDate: new Date(2020, 5, 22),
      minDate: new Date(),
      startingDay: 1
    };

    vm.save = function() {
      var clearance = {
        date_paid: vm.paymentForm.date_paid,
        amount_paid: vm.paymentForm.amount_paid
      };
      var booking = {};
      for(var i = 0; i < vm.bookings.length; i++) {
        if(vm.bookings[i]._id == vm.paymentForm._id) booking = vm.bookings[i];
      }
      booking.clearances.push(clearance);

      // Create a new booking, or update the current instance
      BookingsService.createOrUpdate(booking)
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

    vm.sortTable = function(n) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById("myTable");
        switching = true;
        //Set the sorting direction to ascending:
        dir = "asc"; 
        /*Make a loop that will continue until
        no switching has been done:*/
        while (switching) {
            //start by saying: no switching is done:
            switching = false;
            rows = table.getElementsByTagName("TR");
            /*Loop through all table rows (except the
            first, which contains table headers):*/
            for (i = 1; i < (rows.length - 1); i++) {
            //start by saying there should be no switching:
            shouldSwitch = false;
            /*Get the two elements you want to compare,
            one from current row and one from the next:*/
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            /*check if the two rows should switch place,
            based on the direction, asc or desc:*/
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                //if so, mark as a switch and break the loop:
                shouldSwitch= true;
                break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                //if so, mark as a switch and break the loop:
                shouldSwitch= true;
                break;
                }
            }
            }
            if (shouldSwitch) {
            /*If a switch has been marked, make the switch
            and mark that a switch has been done:*/
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            //Each time a switch is done, increase this count by 1:
            switchcount ++;      
            } else {
            /*If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again.*/
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
            }
        }
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

    vm.showMultipleModel = false;
    vm.onMultiplePayment = function() {
      vm.showMultipleModel = !vm.showMultipleModel;
    }

    vm.allClients = [];
    vm.clients = [];
    $timeout(function () {
      for(var i=0; i<vm.bookings.length; i++) {
        var isFound = false;
        for(var j=0; j<vm.allClients.length; j++) {
          if(vm.allClients[j].toUpperCase() == vm.bookings[i].consignor.name.toUpperCase()) isFound = true;
        }
        if(!isFound) vm.allClients.push(vm.bookings[i].consignor.name);
      }
    }, 500);

    vm.complete = function(selectedClient) {
      vm.clientbookings = [];
			var output=[];
			angular.forEach(vm.allClients,function(clts){
				if(clts.toLowerCase().indexOf(selectedClient.toLowerCase())>=0){
					output.push(clts);
				}
			});
			vm.clients=output;
    }
    
		vm.fillTextbox=function(string){
			vm.selectedClient=string;
      vm.clients=[];
      for(var s=0; s<vm.bookings.length; s++) {
        if(vm.bookings[s].consignor.name.toLowerCase() == vm.selectedClient.toLowerCase())
          vm.clientbookings.push(vm.bookings[s]);
      }
    }
    
    vm.calculateTotalAmount = function() {
      var total = 0;
      for(var i = 0; i < vm.clientbookings.length; i++) {
        if(vm.clientbookings[i].amt != "") total += Number(vm.clientbookings[i].amt);
      }
      return total;
    }

    vm.clientbookings = [];
    vm.selectedDate = {
      isdate: new Date(),
      isOpened: false
    };

    vm.selectDate = function($event, num) {
      if(num == 1) { vm.selectedDate.isOpened = true; }
    };

    vm.dateOptions = {
      formatYear: 'yy',
      maxDate: new Date(2030, 5, 22),
      minDate: new Date(1920, 5, 22),
      startingDay: 1
    };

    vm.saveMultiple = function() {
      for(var e=0; e<vm.clientbookings.length; e++) {
        if(vm.clientbookings[e].amt != "" && vm.clientbookings[e].amt != undefined && vm.clientbookings[e].amt != 0){
          var amt = vm.clientbookings[e].amt;
          delete vm.clientbookings[e].amt;    
          vm.clientbookings[e].clearances.push({
            amount_paid: amt,
            date_paid: vm.selectedDate.isdate
          });

          // Create a new booking, or update the current instance
          BookingsService.createOrUpdate(vm.clientbookings[e])
            .then(successCallback)
            .catch(errorCallback);

          function successCallback(res) {}
          function errorCallback(res) {}
        }
      }
      $state.go('bookings.list');
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Booking saved successfully!' });
    }

  }
}());
