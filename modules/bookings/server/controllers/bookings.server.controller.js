'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Booking = mongoose.model('Booking'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a booking
 */
exports.create = function (req, res) {
  var booking = new Booking(req.body);
  booking.user = req.user;

  booking.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(booking);
    }
  });
};

/**
 * Show the current booking
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var booking = req.booking ? req.booking.toJSON() : {};

  // Add a custom field to the Booking, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Booking model.
  booking.isCurrentUserOwner = !!(req.user && booking.user && booking.user._id.toString() === req.user._id.toString());

  res.json(booking);
};

/**
 * Update an booking
 */
exports.update = function (req, res) {
  var booking = req.booking;

  booking.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(booking);
    }
  });
};

/**
 * Delete an booking
 */
exports.delete = function (req, res) {
  var booking = req.booking;

  booking.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(booking);
    }
  });
};

/**
 * List of bookings
 */
exports.list = function (req, res) {
  Booking.find().sort('-created').populate('user', 'displayName').exec(function (err, bookings) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(bookings);
    }
  });
};

/**
 * Booking middleware
 */
exports.bookingByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Booking is invalid'
    });
  }

  Booking.findById(id).populate('user', 'displayName').exec(function (err, booking) {
    if (err) {
      return next(err);
    } else if (!booking) {
      return res.status(404).send({
        message: 'No booking with that identifier has been found'
      });
    }
    req.booking = booking;
    next();
  });
};
