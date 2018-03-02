(function () {
  'use strict';

  angular
    .module('bookings.services')
    .factory('BookingsService', BookingsService);

  BookingsService.$inject = ['$resource', '$log'];

  function BookingsService($resource, $log) {
    var Booking = $resource('/api/bookings', {}, {
      update: {
        method: 'PUT',
        url: '/api/bookings',
        params: {
          provider: '@provider'
        }
      },
      saveBooking: {
        method: 'POST',
        url: '/api/bookings'
      },
      download: {
        method: 'POST',
        url: '/api/downloads'
      }
    });

    // Handle successful response
    function onSuccess(booking) {
      // Any required internal processing from inside the service, goes here.
    }

    // Handle error response
    function onError(errorResponse) {
      var error = errorResponse.data;
      // Handle error internally
      handleError(error);
    }

    angular.extend(Booking, {
      createOrUpdate: function (booking) {
        if (booking._id) {
          return booking.$update(onSuccess, onError);
        } else {
          return this.saveBooking(booking).$promise;
        }
      },
      downloads: function(bookingId) {
        var params = {"bookingId": bookingId};
        return this.download(params).$promise;
      }
    });

    return Booking;

    function createOrUpdate(booking) {
      if (booking._id) {
        return booking.$update(onSuccess, onError);
      } else {
        return this.saveBooking(booking).$promise;
      }

      // Handle successful response
      function onSuccess(booking) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }

  }
}());
