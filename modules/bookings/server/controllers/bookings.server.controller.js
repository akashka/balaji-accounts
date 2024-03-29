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

var getBankDetails = function(bank) {
  if(bank == 'axis') return ("Jai Balaji Road Ways \n Axis Bank A/c No - 913020025526025 \n IFS - UTIB0000560 \n Branch - Peenya");
  if(bank == 'icici') return ("Jai Balaji Road Ways <br/> ICICI Bank A/c No - 279405500069 <br/> IFS - ICIC0002794 <br/> Branch - Nelamangala");
  return "";
}

var calculateGrand = function(booking) {
  var total = 0;
  if(booking.service_tax != "" && booking.service_tax != undefined) 
    total += parseFloat(booking.service_tax);
  if(booking.basic_amount != "" && booking.basic_amount != undefined) 
    total += parseFloat(booking.basic_amount);
  return total;
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
    stringTemplate = stringTemplate.replace('{{biller_details}}', booking.consignor.name + "\n" + booking.consignor.address + "\n Phone No:" 
+ (booking.consignor.phonenum != undefined ? booking.consignor.phonenum : "") + "\n GSTIN No:" + (booking.consignor.gstin_no != undefined ? booking.consignor.gstin_no : "")
+ "\n State:" + (booking.consignor.state != undefined ?booking.consignor.state : "") + "\n State Code:" + (booking.consignor.state_code != undefined ? booking.consignor.state_code : ""));
    stringTemplate = stringTemplate.replace('{{frightbillno}}', (booking.pod != undefined && booking.pod.bill_no != undefined) ? booking.pod.bill_no : "");
    stringTemplate = stringTemplate.replace('{{invoidedate}}', moment(booking.invoice_date).format("DD-MMM-YYYY"));
    stringTemplate = stringTemplate.replace('{{challan_no}}', booking.challan_number);
    stringTemplate = stringTemplate.replace('{{challan_date}}', moment(booking.lr_date).format("DD-MMM-YYYY"));
    stringTemplate = stringTemplate.replace('{{challan_from}}', booking.from);
    stringTemplate = stringTemplate.replace('{{challan_to}}', booking.to);
    stringTemplate = stringTemplate.replace('{{challan_pkgs}}', booking.package);
    stringTemplate = stringTemplate.replace('{{invoice_no}}', booking.invoice_number);
    stringTemplate = stringTemplate.replace('{{weight}}', booking.weight);
    stringTemplate = stringTemplate.replace('{{amount}}', booking.basic_amount);
    stringTemplate = stringTemplate.replace('{{amount_words}}', convertToWord(calculateGrand(booking)));
    stringTemplate = stringTemplate.replace('{{sub_total}}', (parseFloat(booking.basic_amount)));
    stringTemplate = stringTemplate.replace('{{cgst}}', 0);
    stringTemplate = stringTemplate.replace('{{sgst}}', 0);
    stringTemplate = stringTemplate.replace('{{igst}}', ((booking.service_tax != undefined && booking.service_tax != 0) ? booking.service_tax : 0));
    stringTemplate = stringTemplate.replace('{{grand_total}}', calculateGrand(booking));
    stringTemplate = stringTemplate.replace('{{bank_details}}', getBankDetails(booking.bank));
    stringTemplate = stringTemplate.replace('{{show_vehicle_no}}', (booking.show_vehicle_no) ? ("Vehicle No: " + booking.vehicle_number) : "");

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
