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
