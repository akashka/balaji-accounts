(function () {
  'use strict';

  angular
    .module('home')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$state', 'UsersService', 'BookingsService', '$timeout'];

  function HomeController($state, UsersService, BookingsService, $timeout) {
    var vm = this;

    vm.users = UsersService.query();
    vm.bookings = BookingsService.query();

    vm.totalBusiness = 0;
    vm.totalPayable = 0;
    $timeout(function () {
      for(var k=0; k<vm.bookings.length; k++) {
        vm.totalBusiness += Number(vm.calculateTotal(vm.bookings[k]));
        vm.totalPayable += Number(vm.calculatePayable(vm.bookings[k]));
      }
      vm.calculateMonthlyBusiness();
      vm.calculateClients();
    }, 500);

    vm.eachMonth = [{
        mnth: 0,
        yrs: 2018,
        counter: 0
    },{
        mnth: 1,
        yrs: 2018,
        counter: 0
    },{
        mnth: 2,
        yrs: 2018,
        counter: 0
    },{
        mnth: 3,
        yrs: 2018,
        counter: 0
    },{
        mnth: 4,
        yrs: 2018,
        counter: 0
    },{
        mnth: 5,
        yrs: 2018,
        counter: 0
    },{
        mnth: 6,
        yrs: 2018,
        counter: 0
    },{
        mnth: 7,
        yrs: 2018,
        counter: 0
    },{
        mnth: 8,
        yrs: 2018,
        counter: 0
    },{
        mnth: 9,
        yrs: 2018,
        counter: 0
    },{
        mnth: 10,
        yrs: 2018,
        counter: 0
    },{
        mnth: 11,
        yrs: 2018,
        counter: 0
    }];

    vm.calculateMonthlyBusiness = function() {
      for(var k=0; k<vm.bookings.length; k++) {
        var mnth = moment(vm.bookings[k].lr_date).month();
        var yrs = moment(vm.bookings[k].lr_date).year();
        var isFound = false;
        for(var p=0; p<vm.eachMonth.length; p++) {
          if(vm.eachMonth[p].mnth == mnth && vm.eachMonth[p].yrs == yrs) {
            isFound = true;
            vm.eachMonth[p].counter += 1;
          }
        }
        if(!isFound) {
          vm.eachMonth.push({
            mnth: mnth,
            yrs: yrs,
            counter: 1
          });
        }
      }
      vm.plotChart()
    }

    vm.plotChart = function () {
        var displayData = [
            ['x'],
            ['Bookings']
        ];
        for(var i = 0; i < vm.eachMonth.length; i++) {
            displayData[0].push(moment().month(vm.eachMonth[i].mnth).year(vm.eachMonth[i].yrs));
            displayData[1].push(vm.eachMonth[i].counter);
        }
        vm.chart = c3.generate({
            bindto: '#pickup',
            data: {
                x : 'x',
                columns: displayData,
                names: {
                    x: '',
                    Bookings: 'Bookings',
                },
                type: 'bar'                 
            },
            bar: {
                width: {
                    ratio: 0.6
                }
            },
            color: {
                pattern: ['#d95f02']
            },
            axis: {
                x: {
                    type: 'timeseries',
                    localtime: false,
                    tick: {
                        format: function (x) { return moment(x).format('MMM YYYY'); },
                        centered: true
                    },
                    label: {
                        text: 'Dates',
                        position: 'outer-right'
                    }
                },
                y: {
                    label: {
                        text: 'Bookings',
                        position: 'outer-top'
                    },
                    padding: {
                        bottom: 0
                    }
                }
            },
            point: {
                show: true,
                focus: {
                    expand: {
                        enabled: true
                    }
                }
            },
            legend: {
                show: false,
            } ,
            tooltip: {
                format: {
                    title: function (x) {
                        return moment(x).format("MMM YYYY");
                    },
                    value: function (value, ratio, id) {
                        var format = d3.format(',');
                        var cal = format(value);
                        return (cal);
                    }
                }
            },
        });
    };

    vm.eachConsignor = [];
    vm.calculateClients = function() {
        for(var k=0; k<vm.bookings.length; k++) {
            var isFound = false;
            for(var p=0; p<vm.eachConsignor.length; p++) {
                if(vm.eachConsignor[p].name.toLowerCase() == vm.bookings[k].consignor.name.toLowerCase()) {
                    isFound = true;
                    vm.eachConsignor[p].counter += 1;
                }
            }
            if(!isFound) {
                vm.eachConsignor.push({
                    name: vm.bookings[k].consignor.name.toUpperCase(),
                    counter: 1
                });
            }
        }
        vm.plotChart2()
    }

    vm.plotChart2 = function () {
        var displayData = [
            ['x'],
            ['Bookings']
        ];
        for(var i = 0; i < vm.eachConsignor.length; i++) {
            displayData[0].push(vm.eachConsignor[i].name);
            displayData[1].push(vm.eachConsignor[i].counter);
        }
        vm.chart = c3.generate({
            bindto: '#clients',
            data: {
                x : 'x',
                columns: displayData,
                names: {
                    x: '',
                    Bookings: 'Bookings',
                },
                type: 'bar'                 
            },
            bar: {
                width: {
                    ratio: 0.6
                }
            },
            axis: {
                x: {
                    type: 'category',    
                    tick: {
                        centered: true
                    },
                    label: {
                        text: 'Client',
                        position: 'outer-right'
                    }
                },
                y: {
                    label: {
                        text: 'Bookings',
                        position: 'outer-top'
                    },
                    padding: {
                        bottom: 0
                    }
                }
            },
            point: {
                show: true,
                focus: {
                    expand: {
                        enabled: true
                    }
                }
            },
            legend: {
                show: false,
            } ,
            tooltip: {
                format: {
                    value: function (value, ratio, id) {
                        var format = d3.format(',');
                        var cal = format(value);
                        return (cal);
                    }
                }
            }
        });
    };

    vm.convertToFloat = function(stri) {
      if(stri == null || stri == undefined) return 0;
      return parseFloat(stri);
    }

    vm.calculateTotal = function(booking) {
        var total = 0;
        if(booking.basic_amount != "") total += vm.convertToFloat(booking.basic_amount);
        if(booking.service_tax != "") total += vm.convertToFloat(booking.service_tax);
        for(var e=0; e<booking.extra_breakup.length; e++) {
          if(booking.extra_breakup[e].extra_value != "") total += vm.convertToFloat(booking.extra_breakup[e].extra_value);
        }
        return total;
    }

    vm.calculatePayable = function(booking) {
        var total = 0;
        if(booking.commission != "") total += vm.convertToFloat(booking.commission);
        if(booking.interest != "") total += vm.convertToFloat(booking.interest);
        if(booking.extra != "") total += vm.convertToFloat(booking.extra);
        if(booking.crane_charge != "") total += vm.convertToFloat(booking.crane_charge);
        if(booking.halting != "") total += vm.convertToFloat(booking.halting);
        if(booking.hire != "") total += vm.convertToFloat(booking.hire);
        return total;
    }

  }
}());
