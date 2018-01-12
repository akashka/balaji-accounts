'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Booking = mongoose.model('Booking'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  booking;

/**
 * Booking routes tests
 */
describe('Booking CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose.connection.db);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.usernameOrEmail,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new booking
    user.save()
      .then(function () {
        booking = {
          title: 'Booking Title',
          content: 'Booking Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an booking if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/bookings')
          .send(booking)
          .expect(403)
          .end(function (bookingSaveErr, bookingSaveRes) {
            // Call the assertion callback
            done(bookingSaveErr);
          });

      });
  });

  it('should not be able to save an booking if not logged in', function (done) {
    agent.post('/api/bookings')
      .send(booking)
      .expect(403)
      .end(function (bookingSaveErr, bookingSaveRes) {
        // Call the assertion callback
        done(bookingSaveErr);
      });
  });

  it('should not be able to update an booking if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/bookings')
          .send(booking)
          .expect(403)
          .end(function (bookingSaveErr, bookingSaveRes) {
            // Call the assertion callback
            done(bookingSaveErr);
          });
      });
  });

  it('should be able to get a list of bookings if not signed in', function (done) {
    // Create new booking model instance
    var bookingObj = new Booking(booking);

    // Save the booking
    bookingObj.save(function () {
      // Request bookings
      agent.get('/api/bookings')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single booking if not signed in', function (done) {
    // Create new booking model instance
    var bookingObj = new Booking(booking);

    // Save the booking
    bookingObj.save(function () {
      agent.get('/api/bookings/' + bookingObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', booking.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single booking with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/bookings/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Booking is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single booking which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent booking
    agent.get('/api/bookings/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No booking with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an booking if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/bookings')
          .send(booking)
          .expect(403)
          .end(function (bookingSaveErr, bookingSaveRes) {
            // Call the assertion callback
            done(bookingSaveErr);
          });
      });
  });

  it('should not be able to delete an booking if not signed in', function (done) {
    // Set booking user
    booking.user = user;

    // Create new booking model instance
    var bookingObj = new Booking(booking);

    // Save the booking
    bookingObj.save(function () {
      // Try deleting booking
      agent.delete('/api/bookings/' + bookingObj._id)
        .expect(403)
        .end(function (bookingDeleteErr, bookingDeleteRes) {
          // Set message assertion
          (bookingDeleteRes.body.message).should.match('User is not authorized');

          // Handle booking error error
          done(bookingDeleteErr);
        });

    });
  });

  it('should be able to get a single booking that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      usernameOrEmail: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin']
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new booking
          agent.post('/api/bookings')
            .send(booking)
            .expect(200)
            .end(function (bookingSaveErr, bookingSaveRes) {
              // Handle booking save error
              if (bookingSaveErr) {
                return done(bookingSaveErr);
              }

              // Set assertions on new booking
              (bookingSaveRes.body.title).should.equal(booking.title);
              should.exist(bookingSaveRes.body.user);
              should.equal(bookingSaveRes.body.user._id, orphanId);

              // force the booking to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the booking
                    agent.get('/api/bookings/' + bookingSaveRes.body._id)
                      .expect(200)
                      .end(function (bookingInfoErr, bookingInfoRes) {
                        // Handle booking error
                        if (bookingInfoErr) {
                          return done(bookingInfoErr);
                        }

                        // Set assertions
                        (bookingInfoRes.body._id).should.equal(bookingSaveRes.body._id);
                        (bookingInfoRes.body.title).should.equal(booking.title);
                        should.equal(bookingInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single booking if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new booking model instance
    var bookingObj = new Booking(booking);

    // Save the booking
    bookingObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/bookings/' + bookingObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', booking.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single booking, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'bookingowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Booking
    var _bookingOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _bookingOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Booking
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new booking
          agent.post('/api/bookings')
            .send(booking)
            .expect(200)
            .end(function (bookingSaveErr, bookingSaveRes) {
              // Handle booking save error
              if (bookingSaveErr) {
                return done(bookingSaveErr);
              }

              // Set assertions on new booking
              (bookingSaveRes.body.title).should.equal(booking.title);
              should.exist(bookingSaveRes.body.user);
              should.equal(bookingSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the booking
                  agent.get('/api/bookings/' + bookingSaveRes.body._id)
                    .expect(200)
                    .end(function (bookingInfoErr, bookingInfoRes) {
                      // Handle booking error
                      if (bookingInfoErr) {
                        return done(bookingInfoErr);
                      }

                      // Set assertions
                      (bookingInfoRes.body._id).should.equal(bookingSaveRes.body._id);
                      (bookingInfoRes.body.title).should.equal(booking.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (bookingInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Booking.remove().exec()
      .then(User.remove().exec())
      .then(done())
      .catch(done);
  });
});
