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
describe('Booking Admin CRUD tests', function () {
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
      roles: ['user', 'admin'],
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

  it('should be able to save an booking if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new booking
        agent.post('/api/bookings')
          .send(booking)
          .expect(200)
          .end(function (bookingSaveErr, bookingSaveRes) {
            // Handle booking save error
            if (bookingSaveErr) {
              return done(bookingSaveErr);
            }

            // Get a list of booking
            agent.get('/api/booking')
              .end(function (bookingsGetErr, bookingsGetRes) {
                // Handle booking save error
                if (csGetErr) {
                  return done(bookingsGetErr);
                }

                // Get bookings list
                var bookings = bookingsGetRes.body;

                // Set assertions
                (bookings[0].user._id).should.equal(userId);
                (bookings[0].title).should.match('Booking Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an booking if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new booking
        agent.post('/api/bookings')
          .send(booking)
          .expect(200)
          .end(function (bookingSaveErr, bookingSaveRes) {
            // Handle booking save error
            if (bookingSaveErr) {
              return done(bookingSaveErr);
            }

            // Update booking title
            booking.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing booking
            agent.put('/api/bookings/' + bookingSaveRes.body._id)
              .send(booking)
              .expect(200)
              .end(function (bookingUpdateErr, bookingUpdateRes) {
                // Handle booking update error
                if (bookingUpdateErr) {
                  return done(bookingUpdateErr);
                }

                // Set assertions
                (bookingUpdateRes.body._id).should.equal(bookingSaveRes.body._id);
                (bookingUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an booking if no title is provided', function (done) {
    // Invalidate title field
    booking.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new booking
        agent.post('/api/bookings')
          .send(booking)
          .expect(422)
          .end(function (bookingSaveErr, bookingSaveRes) {
            // Set message assertion
            (bookingSaveRes.body.message).should.match('Title cannot be blank');

            // Handle booking save error
            done(bookingSaveErr);
          });
      });
  });

  it('should be able to delete an booking if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new booking
        agent.post('/api/bookings')
          .send(booking)
          .expect(200)
          .end(function (bookingSaveErr, bookingSaveRes) {
            // Handle booking save error
            if (bookingSaveErr) {
              return done(bookingSaveErr);
            }

            // Delete an existing booking
            agent.delete('/api/bookings/' + bookingSaveRes.body._id)
              .send(booking)
              .expect(200)
              .end(function (bookingDeleteErr, bookingDeleteRes) {
                // Handle booking error error
                if (bookingDeleteErr) {
                  return done(bookingDeleteErr);
                }

                // Set assertions
                (bookingDeleteRes.body._id).should.equal(bookingSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single booking if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new booking model instance
    booking.user = user;
    var bookingObj = new Booking(booking);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new booking
        agent.post('/api/bookings')
          .send(booking)
          .expect(200)
          .end(function (bookingSaveErr, bookingSaveRes) {
            // Handle booking save error
            if (bookingSaveErr) {
              return done(bookingSaveErr);
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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (bookingInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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
