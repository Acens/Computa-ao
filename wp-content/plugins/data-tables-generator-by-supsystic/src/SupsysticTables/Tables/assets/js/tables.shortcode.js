(function ($, rule, app) {

    $(document).ready(function () {
        $('.supsystic-table').each(function () {
            app.initializeTable(this);

            var table = $(this),
                ruleJS = new rule(table.attr('id'));

            table.on('draw.dt', function () {
                ruleJS.init();

                table.find('td').each(function () {
                    var color = /color\-([0-9abcdef]{6})/.exec(this.className),
                        background = /bg\-([0-9abcdef]{6})/.exec(this.className);

                    if (null !== color) {
                        $(this).css({color: '#' + color[1]});
                    }

                    if (null !== background) {
                        $(this).css({backgroundColor: '#' + background[1]});
                    }
                });
            });

            table.trigger('draw.dt');

            // Custom css
            var $css = $('#' + table.attr('id') + '-css');
            if ($css.length) {
                $('head').append($('<style/>').text($css.text()));
                $css.remove();
            }
        });
    });

}(window.jQuery, window.ruleJS, window.supsystic.Tables));