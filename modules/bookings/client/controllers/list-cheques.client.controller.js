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
      if ($window.confirm('Are you sure you received payment for ' + bookingid)) {
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

  }
}());
