'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Booking = mongoose.model('Booking'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  PDFDocument = require('pdfkit'),
  fs = require('fs'),
  moment = require('moment');
var htmlToPdf = require('html-to-pdf');
var conversion = require("phantom-html-to-pdf")();

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
  var id = req.body._id;
  var booking = req.body;
  delete booking._id;

  Booking.update({_id: id}, booking, {upsert: true, new: true}, function (err) {
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

var convertToWord = function(num) {
    var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
    var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
}

exports.downloadByID = function (req, res) {
  var id = req.params.bookingId;
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
    
    var stringTemplate = fs.readFileSync(path.join(__dirname, '../controllers') + '/bill.html', "utf8");
    stringTemplate = stringTemplate.replace('{{biller_details}}', booking.consignor.name + "<br>" + booking.consignor.address + "<br>" + booking.consignor.phonenum);
    stringTemplate = stringTemplate.replace('{{frightbillno}}', (booking.pod.billno != undefined) ? booking.pod.billno : "");
    stringTemplate = stringTemplate.replace('{{invoidedate}}', moment(booking.invoice_date).format("DD-MMM-YYYY"));
    stringTemplate = stringTemplate.replace('{{challan_no}}', booking.challan_number);
    stringTemplate = stringTemplate.replace('{{challan_date}}', moment(booking.lr_date).format("DD-MMM-YYYY"));
    stringTemplate = stringTemplate.replace('{{challan_from}}', booking.from);
    stringTemplate = stringTemplate.replace('{{challan_to}}', booking.to);
    stringTemplate = stringTemplate.replace('{{challan_pkgs}}', booking.package);
    stringTemplate = stringTemplate.replace('{{invoice_no}}', booking.invoice_number);
    stringTemplate = stringTemplate.replace('{{weight}}', booking.weight);
    stringTemplate = stringTemplate.replace('{{amount}}', booking.basic_amount);
    stringTemplate = stringTemplate.replace('{{amount_words}}', convertToWord(parseFloat(booking.service_tax) + parseFloat(booking.basic_amount)));
    stringTemplate = stringTemplate.replace('{{sub_total}}', (parseFloat(booking.service_tax) + parseFloat(booking.basic_amount)));
    stringTemplate = stringTemplate.replace('{{cgst}}', 0);
    stringTemplate = stringTemplate.replace('{{sgst}}', 0);
    stringTemplate = stringTemplate.replace('{{igst}}', booking.service_tax);
    stringTemplate = stringTemplate.replace('{{grand_total}}', (parseFloat(booking.service_tax) + parseFloat(booking.basic_amount)));

    conversion({ html: stringTemplate }, function(err, pdf) {
        var output = fs.createWriteStream('./output.pdf');
        pdf.stream.pipe(output);
        let filename = "invoice";
        filename = encodeURIComponent(filename) + '.pdf';
        var file = fs.readFileSync('./output.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        pdf.stream.pipe(res);
    });

  });
}
