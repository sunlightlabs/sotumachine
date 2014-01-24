$(function (){

    // chart.js
    var ctx = document.getElementById("sotu-chart").getContext("2d");
    var data = [
        {
            value: 30,
            color:"#F7464A"
        },
        {
            value : 50,
            color : "#E2EAE9"
        },
        {
            value : 100,
            color : "#D4CCC5"
        },
        {
            value : 40,
            color : "#949FB1"
        },
        {
            value : 120,
            color : "#4D5360"
        }

    ]
    var options = {
        segmentShowStroke : false,
        percentageInnerCutout : 80
    }
    
    new Chart(ctx).Doughnut(data, options);



    // gradient for slider fill
    $('input[type="range"]').change(function () {
        var val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));
        
        $(this).css('background-image',
                    '-webkit-gradient(linear, left top, right top, '
                    + 'color-stop(' + val + ', #5bc0de), '
                    + 'color-stop(' + val + ', #222)'
                    + ')'
                    );
    });

    // buttons do things
    var $btncta = $('.btn-cta'),
        $btnback = $('.btn-back'),
        $wrapper = $('.sidebar-wrapper');

    $btncta.on('click', function() {
        $wrapper.toggleClass('active');
        $btnback.toggleClass('hidden');
    });
    $btnback.on('click', function() {
        $wrapper.toggleClass('active');
        $btnback.toggleClass('hidden');
    });    
});