
var currentIWS;

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
    var $btncta = $('.splash .btn-cta'),
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


    function Speech(elem) {
        this.elem = $(elem);
    };
    Speech.prototype.clear = function() {
        this.elem.empty();
    };
    Speech.prototype.generate = function(iws) {
        var speech = this;
        iws = iws || this.randomIWS();
        this.clear();
        $.when(
        $.get(
            '/generate?iws=' + iws,
            function (data, status, xhr) {
                console.log('processing data');
                for (var i = 0; i < data.content.length; i++) {

                    var pElem = $('<p>');
                    pElem.addClass('prezColors');

                    for (var j = 0; j < data.content[i].length; j++) {
                        var sentence = data.content[i][j];
                        var spanElem = $('<span>');
                        spanElem.addClass('sentence');
                        spanElem.attr('data-prez-id', sentence[0]);
                        spanElem.text(sentence[1] + ' ');
                        pElem.append(spanElem);
                    }

                    speech.elem.append(pElem);
                }
                console.log('done appending paragraphs');
            }
        )).then( function() {
            currentIWS = iws;
            dispatch.generated(currentIWS);
        });
    };
    Speech.prototype.randomIWS = function() {
        var result = null;
        $.ajax({
            url: '/iws',
            type: 'get',
            dataType: 'text',
            async: false,
            success: function(data) {
                result = data;
            }
        });
        return result;
    };

    speech = new Speech('.the-speech-content');

    $('a.generate-it').click(function(ev) {
        ev.preventDefault();
        speech.generate()
    });

});
