
var currentIWS;

$(function (){

    var liveGenerate = true;

    function Console() {};
    Console.prototype.log = function(msg) {};
    console = console || new Console();

    // gradient for slider fill

    var prezFillColors = {  "01": "#6BBBA1",
                        "03": "#C8D7A1",
                        "16": "#F2DA57",
                        "26": "#F6B656",
                        "40": "#E25A42",
                        "41": "#DCBDCF",
                        "42": "#B396AD",
                        "43": "#E58429",
                        "44": "#B0CBDB"  }


    function fillSlider() {
            var val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));
            var fillColor = '#c9a706';
            var baseColor = '#333';

            $(this).css('background-image',
                        '-webkit-gradient(linear, left top, right top, '
                        + 'color-stop(' + val + ',' + prezFillColors[$(this).attr('data-prez-id')] + '),'
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
        content: geturl
    });

    // set width for fixed footer correctly, with window resize
    var $footer = $('footer');

    function updateFooterWidth() {
        $footer.css('max-width', $(this).width() - 300);
    }
    $(window).on('resize', updateFooterWidth);
    updateFooterWidth();

    function updateMethologyHeight() {
        console.log($(this).height() - 100);
        $('.methodology.active').css('max-height', $(this).height() - 100);
    }
    $(window).on('resize', updateMethologyHeight);
    updateMethologyHeight();

    // toggle methodology

    $('.methodolgy-link').click(function() {
      $('.methodology').toggleClass('active');
      $footer.toggleClass('active');
    });

    // speech

    function Speech(elem) {
        this.elem = $(elem);
        this.iws = null;
        this.id = null;
    };
    Speech.prototype.clear = function() {
        this.elem.empty();
    };
    Speech.prototype.render = function(speech) {
        this.clear();
        for (var i = 0; i < speech.content.length; i++) {

            var pElem = $('<p>').addClass('prezColors');

            for (var j = 0; j < speech.content[i].length; j++) {
                var sentence = speech.content[i][j];
                pElem.append(
                    $('<span>')
                        .addClass('sentence')
                        .attr('data-prez-id', sentence[0])
                        .text(sentence[1])
                ).append(' ');
            }

            this.elem.append(pElem);
        }
        console.log('done appending paragraphs');
    };
    Speech.prototype.generate = function(iws) {
        var speech = this;
        iws = iws || this.getIWS();
        $.when(
            $.get(
                '/generate?iws=' + iws,
                function (data, status, xhr) {
                    console.log('processing data');
                    speech.render(data);
                    speech.id = data.id;
                    speech.iws = data.iws;
                    if (history && history.pushState) {
                        history.pushState({'id': data.id, 'iws': data.iws}, '', '/s/' + data.id);
                        if (twttr) { twttr.widgets.load(); }
                    }
                    speech.createShareButtons();
                }
            )
        ).then(function() {
            dispatch.generated(iws);
            $('')
        });
    };
    Speech.prototype.randomIWS = function() {
        var iws = null;
        $.ajax({
            url: '/iws',
            type: 'get',
            dataType: 'text',
            async: false,
            success: function(data) {
                iws = data;
            }
        });
        console.log('random IWS: ' + iws);
        return iws;
    };
    Speech.prototype.getIWS = function() {
        var iws = _.reduce(
            $('#president-form input'),
            function(memo, elem) {
                var $elem = $(elem);
                return memo + $elem.attr('data-prez-id') + $elem.val();
            },
            ''
        );
        console.log('IWS: ' + iws);
        return iws;
    };
    Speech.prototype.reload = function(id) {
        var speech = this;
        console.log('reloading ' + id);
        $.when(
            $.get('/s/' + id, function(data, status, xhr) {
                speech.id = data.id;
                speech.iws = data.iws;
                speech.render(data);
                speech.updateSliders(speech.iws);
                speech.createShareButtons();
            })
        ).then(function() { dispatch.generated(speech.iws); });

    };
    Speech.prototype.updateSliders = function(iws) {
        liveGenerate = false;
        $('#president-form input').each(function(index, elem) {
            var val = parseInt(iws[(index * 3) + 2]);
            $(elem).val(val).trigger('change');
        });
        liveGenerate = true;
    };
    Speech.prototype.createShareButtons = function() {
        var $socialite = $('<div></div>')
            .addClass('share-buttons')
            .attr('data-layout', 'horizontal')
            .attr('data-socialite', 'auto')
            .attr('data-services', 'twitter-share,facebook-like')
            .attr('data-twitter-share-options', 'defaultText=A%20dash%20of%20Obama%2C%20a%20touch%20of%20Reagan%2C%20add%20some%20Lincoln%20and%20GO!%20Create%20your%20own%20%23SOTU%20with%20%23SOTUmachine')
            .appendTo($('.social-buttons').empty())
            .trigger('register');
    }

    speech = new Speech('.the-speech-content');

    // $('a.generate-it').click(function(ev) {
    //     ev.preventDefault();
    //     speech.generate();
    // });

    $("#president-form input[type=range]").change(function(ev) {
        if (liveGenerate)
            speech.generate();
    })

    $(window).bind('popstate', function() {
        if (window.location.hash) {
            var id = parseLocation();
            if (id) {
                speech.clear();
                speech.reload(id);
            }
        }
        if (twttr) { twttr.widgets.load(); }
    });


    /*
     * init everything
     */

    var parseLocation = function() {
        var match = window.location.pathname.match(/\/s\/(\w{8})/);
        if (match) {
            return match[1];
        }
    };

    var initId = parseLocation();
    if (initId) {
        speech.reload(initId);
    } else {
        speech.updateSliders(speech.randomIWS());
        speech.generate();
    }

});
