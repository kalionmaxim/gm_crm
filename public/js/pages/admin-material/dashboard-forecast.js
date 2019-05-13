$(".counter").counterUp({
    delay: 100,
    time : 1200
});

$('.vcarousel').carousel({
    interval: 3000
})
$(document).ready(function() {

    var sparklineLogin = function() {
        $('#sparklinedash').sparkline([0, 5, 6, 10, 9, 12, 4, 9, 12, 10, 9], {
            type      : 'bar',
            height    : '30',
            barWidth  : '4',
            resize    : true,
            barSpacing: '10',
            barColor  : '#4caf50'
        });
        $('#sparklinedash2').sparkline([0, 5, 6, 10, 9, 12, 4, 9, 12, 10, 9], {
            type      : 'bar',
            height    : '30',
            barWidth  : '4',
            resize    : true,
            barSpacing: '10',
            barColor  : '#9675ce'
        });
        $('#sparklinedash3').sparkline([0, 5, 6, 10, 9, 12, 4, 9, 12, 10, 9], {
            type      : 'bar',
            height    : '30',
            barWidth  : '4',
            resize    : true,
            barSpacing: '10',
            barColor  : '#03a9f3'
        });
        $('#sparklinedash4').sparkline([0, 5, 6, 10, 9, 12, 4, 9, 12, 10, 9], {
            type      : 'bar',
            height    : '30',
            barWidth  : '4',
            resize    : true,
            barSpacing: '10',
            barColor  : '#f96262'
        });

    }
    var sparkResize;

    $(window).resize(function(e) {
        clearTimeout(sparkResize);
        sparkResize = setTimeout(sparklineLogin, 500);
    });
    sparklineLogin();

});

var morrisChart1 = Morris.Area({
    element       : 'morris-area-chart',
    data          : chart1,
    lineColors    : ['#00c292', '#03a9f3'],
    xkey          : 'period',
    ykeys         : ['month', 'year'],
    labels        : ['Месяц', 'Год'],
    pointSize     : 0,
    lineWidth     : 0,
    resize        : true,
    fillOpacity   : 0.8,
    behaveLikeLine: true,
    gridLineColor : 'rgba(255, 255, 255, 0.1)',
    hideHover     : 'auto'

});

var StatBarChart = Morris.Bar({
    element: 'stat-bar-chart',
    data   : moneyByDates,
    resize : true,
    /*data   : [
     {date: '2006', value: 100},
     {date: '2007', value: 75},
     {date: '2008', value: 50},
     {date: '2009', value: 75},
     {date: '2010', value: 50},
     {date: '2011', value: 75},
     {date: '2012', value: 100}
     ],*/
    xkey   : 'date',
    ykeys  : ['value'],
    labels : ['Сумма']
});
//Morris.Area({
//        element: 'morris-area-chart2',
//        data: [{
//            period: '2010',
//            SiteA: 0,
//            SiteB: 0,
//
//        }, {
//            period: '2011',
//            SiteA: 130,
//            SiteB: 100,
//
//        }, {
//            period: '2012',
//            SiteA: 80,
//            SiteB: 60,
//
//        }, {
//            period: '2013',
//            SiteA: 70,
//            SiteB: 200,
//
//        }, {
//            period: '2014',
//            SiteA: 180,
//            SiteB: 150,
//
//        }, {
//            period: '2015',
//            SiteA: 105,
//            SiteB: 90,
//
//        },
//         {
//            period: '2016',
//            SiteA: 250,
//            SiteB: 150,
//
//        }],
//        xkey: 'period',
//        ykeys: ['SiteA', 'SiteB'],
//        labels: ['Site A', 'Site B'],
//        pointSize: 0,
//        fillOpacity: 0.4,
//        pointStrokeColors:['#5e6d88', '#01c0c8'],
//        behaveLikeLine: true,
//        gridLineColor: 'rgba(255, 255, 255, 0.1)',
//        lineWidth: 0,
//        smooth: false,
//        hideHover: 'auto',
//        lineColors: ['#5e6d88', '#01c0c8'],
//        resize: true
//
//    });
/*
 $(document).ready(function() {

 var sparklineLogin = function() {
 sparklineChart2(chart2);
 $('#sales2').sparkline([6, 10, 9, 11, 9, 10, 12], {
 type      : 'bar',
 height    : '154',
 barWidth  : '4',
 resize    : true,
 barSpacing: '10',
 barColor  : '#25a6f7'
 });

 }
 var sparkResize;

 $(window).resize(function(e) {
 clearTimeout(sparkResize);
 sparkResize = setTimeout(sparklineLogin, 500);
 });
 sparklineLogin();

 });

 var sparklineChart2 = function(chart2) {
 $('#sales1').sparkline(chart2, {
 type       : 'pie',
 height     : '100%',
 width      : '100%',
 resize     : true,
 sliceColors: ['#00c292', '#03a9f3']
 });
 }*/
