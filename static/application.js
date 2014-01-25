$(function (){

    // gradient for slider fill
        
    function fillSlider() {
            var val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));
            var fillColor = '#c9a706';
            var baseColor = '#333';

            $(this).css('background-image',
                        '-webkit-gradient(linear, left top, right top, '
                        + 'color-stop(' + val + ',' + fillColor + '),' 
                        + 'color-stop(' + val + ',' + baseColor + ')'
                        + ')'
                        );
    }

    $('input[type="range"]')
        .each(fillSlider)
        .change(fillSlider);

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
        placement: 'left',
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
