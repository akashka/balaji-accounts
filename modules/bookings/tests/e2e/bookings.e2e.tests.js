'use strict';

describe('Bookings E2E Tests:', function () {
  describe('Test bookings page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/bookings');
      expect(element.all(by.repeater('booking in bookings')).count()).toEqual(0);
    });
  });
});
