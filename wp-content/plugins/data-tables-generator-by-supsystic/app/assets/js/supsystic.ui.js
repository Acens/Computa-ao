/*
 * Main UI file.
 *
 * Here we activate and configure all scripts or
 * jQuery plugins required for UI.
 *
 */
(function ($, window, vendor, undefined) {

    $(document).ready(function () {

        /* Bootstrap Tooltips */
        $('body').tooltip({
            selector: '.supsystic-plugin [data-toggle="tooltip"]',
            container: 'body'
        });

        /* Minimum height for the container */
        var $autoHeight = $('.supsystic-item'),
            naviationHeight = $('.supsystic-navigation').outerHeight();

        $autoHeight.each(function () {
            $(this).css({ minHeight: naviationHeight });
        });

        $('input').iCheck({
            checkboxClass: 'icheckbox_minimal',
            radioClass:    'iradio_minimal'
        });
    });

}(jQuery, window, 'supsystic'));