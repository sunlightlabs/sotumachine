$(function (){

    /*// chart.js
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
*/

    // gradient for slider fill
        
    function fillSlider(e) {
            var val = ($(e).val() - $(e).attr('min')) / ($(e).attr('max') - $(e).attr('min'));
            var fillColor = '#c9a706';
            var baseColor = '#333';

            $(e).css('background-image',
                        '-webkit-gradient(linear, left top, right top, '
                        + 'color-stop(' + val + ',' + fillColor + '),' 
                        + 'color-stop(' + val + ',' + baseColor + ')'
                        + ')'
                        );
    }

    $('input[type="range"]').each(function () {    
        fillSlider(this);
    });

    $('input[type="range"]').change(function () {
        fillSlider(this);
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

    // permalink popover
    function geturl(){
        return '<span class="permalink">'+ window.location.href +'</span>';
    } 

    $('#permalink').popover({
        placement: 'top',
        html: true,
        content: geturl()
    });

    // set width for fixed footer correctly, with window resize
    var $footer = $('footer');

    function updateFooterWidth() {
        $footer.css('max-width', $(this).width() - 300);
    }
    $(window).on('resize', updateFooterWidth);
    updateFooterWidth();

});
