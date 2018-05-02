(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('ChequesListController', ChequesListController);

  ChequesListController.$inject = ['BookingsService', 'Notification', '$state', '$window'];

  function ChequesListController(BookingsService, Notification, $state, $window) {
    var vm = this;

    vm.bookings = BookingsService.query();

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

    vm.onPaymentDone = function(bookingid, type) {
      if ($window.confirm('Are you sure you cleared payment for ' + bookingid)) {
        var bookingForm = null;
        for(var i = 0; i < vm.bookings.length; i++) {
          if(vm.bookings[i]._id == bookingid) {
            bookingForm = vm.bookings[i];
            if(type == 'pay') bookingForm.payments_cleared = "clear";
            else if(type == 'bal') bookingForm.balance_cleared = "clear";
          }
        }
        BookingsService.createOrUpdate(bookingForm)
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('bookings.cheque');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Booking saved successfully!' });
        }
        function errorCallback(res) {
          Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Booking save error!' });
        }
      }
    }

    vm.sortTable = function(n) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById("myTable1");
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

  }
}());
