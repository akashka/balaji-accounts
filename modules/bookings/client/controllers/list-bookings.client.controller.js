(function () {
  'use strict';

  angular
    .module('bookings')
    .controller('BookingsListController', BookingsListController);

  BookingsListController.$inject = ['BookingsService', '$state', 'moment', '$http', 'Notification'];

  function BookingsListController(BookingsService, $state, moment, pdfMake, $http, Notification) {
    var vm = this;

    vm.bookings = BookingsService.query();
    vm.allBookings = BookingsService.query();

    vm.search = {
      lr_number: "",
      challan_number: "",
      invoice_number: "",
      lr_from: "",
      lr_to: ""
    }

    vm.searches = function() {
      vm.bookings = [];
      var bookings = vm.allBookings;
      for(var i = 0; i < bookings.length; i++) {
        if(vm.search.lr_number != "" && vm.search.lr_number == bookings[i].lr_number)
          vm.bookings.push(bookings[i]);
        else if(vm.search.challan_number != "" && vm.search.challan_number == bookings[i].challan_number)
          vm.bookings.push(bookings[i]);
        else if(vm.search.invoice_number != "" && vm.search.invoice_number == bookings[i].invoice_number)
          vm.bookings.push(bookings[i]);
        else if(vm.search.lr_from != "" && moment(vm.search.lr_from) <= moment(bookings[i].lr_date))
          vm.bookings.push(bookings[i]);
        else if(vm.search.lr_to != undefined && moment(vm.search.lr_to) >= moment(bookings[i].lr_date))
          vm.bookings.push(bookings[i]);
      }        
    }

    vm.reset = function() {
      vm.bookings = vm.allBookings;
      vm.search = {
        lr_number: "",
        challan_number: "",
        invoice_number: "",
        lr_from: "",
        lr_to: ""
      };
      vm.lr_from = {isOpened: false};
      vm.lr_to = {isOpened: false}; 
    }

    vm.gotoNewBooking = function() {
        $state.go('bookings.create');
    }

    vm.lr_from = {isOpened: false};
    vm.lr_to = {isOpened: false}; 

    vm.selectDate = function($event, num) {
      if(num == 1) { vm.lr_from.isOpened = true; }
      if(num == 2) { vm.lr_to.isOpened = true; }
    };
    
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

    vm.download = function(bookingId) {
      // BookingsService.downloads(bookingId)
        // .then(function (res) {
            // var file = new Blob([res], { type: 'application/pdf' });
            var fileurl = "/api/downloads/" + bookingId;
            window.open(fileurl, '_blank', '');
            // Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Booking saved successfully!' });
        // })
        // .catch(function (res) {
            // Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Booking save error!' });
        // });
    }

  }
}());
