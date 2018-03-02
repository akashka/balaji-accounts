'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

/**
 * Booking Schema
 */
var BookingSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  lr_date: {
    type: Date,
    default: Date.now
  },
  lr_number: {
    type: String,
    default: '',
    trim: true,
    required: 'LR Number cannot be blank'
  },
  challan_number: {
    type: String,
    default: ''
  },
  branch_area: {
    type: String,
    default: ''
  },
  from: {
    type: String,
    default: ''
  },
  to: {
    type: String,
    default: ''
  },
  package: {
    type: String,
    default: ''
  },
  weight: {
    type: String,
    default: ''
  },
  consignor: {
  },
  consignee: {
  },
  invoice_number: {
    type: String,
    default: ''
  },
  invoice_date: {
    type: Date,
    default: Date.now
  },
  vehicle_number: {
    type: String,
    default: ''
  },
  basic_amount: {
    type: String,
    default: ''
  },
  service_tax: {
    type: String,
    default: ''
  },
  other_charge: {
    type: String,
    default: ''
  },
  booking_method: {
    type: String,
    default: ''
  },
  vehicle_owner_broker_name: {
  },
  commission: {
    type: String,
    default: ''
  },
  interest: {
    type: String,
    default: ''
  },
  extra: {
    type: String,
    default: ''
  },
  crane_charge: {
    type: String,
    default: ''
  },
  halting: {
    type: String,
    default: ''
  },
  hire: {
    type: String,
    default: ''
  },
  vehicle_type: {
    type: String,
    default: ''
  },
  advance: {
    type: String,
    default: ''
  },
  payments: {},
  balance: {},
  payments_cleared: {
    type: String,
    default: ''
  },
  balance_cleared: {
    type: String,
    default: ''
  },
  pod: {},
  remarks: "",
  driver: {},
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

BookingSchema.statics.seed = seed;

mongoose.model('Booking', BookingSchema);

/**
* Seeds the User collection with document (Booking)
* and provided options.
*/
function seed(doc, options) {
  var Booking = mongoose.model('Booking');

  return new Promise(function (resolve, reject) {

    skipDocument()
      .then(findAdminUser)
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function findAdminUser(skip) {
      var User = mongoose.model('User');

      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve(true);
        }

        User
          .findOne({
            roles: { $in: ['admin'] }
          })
          .exec(function (err, admin) {
            if (err) {
              return reject(err);
            }

            doc.user = admin;

            return resolve();
          });
      });
    }

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        Booking
          .findOne({
            lr_number: doc.lr_number
          })
          .exec(function (err, existing) {
            if (err) {
              return reject(err);
            }

            if (!existing) {
              return resolve(false);
            }

            if (existing && !options.overwrite) {
              return resolve(true);
            }

            // Remove Booking (overwrite)

            existing.remove(function (err) {
              if (err) {
                return reject(err);
              }

              return resolve(false);
            });
          });
      });
    }

    function add(skip) {
      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve({
            message: chalk.yellow('Database Seeding: Booking\t' + doc.lr_number + ' skipped')
          });
        }

        var booking = new Booking(doc);

        booking.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Booking\t' + booking.lr_number + ' added'
          });
        });
      });
    }
  });
}
