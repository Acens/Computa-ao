(function ($, app) {

    $(document).ready(function () {

        var $loader = $('#formLoading');
        var $error = $('#formError');
        var $input = $('#addDialog_title'),
            $cols = $('#addDialog_cols'),
            $rows = $('#addDialog_rows');

        var $tables = $('#tables');

        $tables.DataTable({
            info: false,
            lengthChange: false,
            columnDefs: [
                { "orderable": false, "targets": [1, 2, 3, 4, 5] }
            ],
            fnInitComplete: function () {
                $('.paginate_button').removeClass('paginate_button').addClass('button button-small');
            }
        });

        var buttonOkClick = function () {
            if ((isNaN($cols.val()) || !$cols.val().length ) || (isNaN($rows.val()) || !$rows.val().length)) {
                $error.find('p').text('Columns and rows value must be a numbers and not empty.');
                $error.fadeIn();

                return;
            }

            if (parseInt($cols.val()) < $cols.attr('min') || parseInt($cols.val()) > $cols.attr('max')) {
                $error.find('p').text('Columns value can\'t be less then ' + $cols.attr('min') + ' and greater then ' + $cols.attr('max') + '.');
                $error.fadeIn();

                return;
            }

            if (parseInt($rows.val()) < $rows.attr('min') || parseInt($rows.val()) > $rows.attr('max')) {
                $error.find('p').text('Rows value can\'t be less then ' + $rows.attr('min') + ' and greater then ' + $rows.attr('max') + '.');
                $error.fadeIn();

                return;
            }

            var request = app.request({
                module: 'tables',
                action: 'create'
            }, {
                title: $input.val()
            });

            $loader.fadeIn();
            $error.fadeOut();


            request
                .done(function (response) {
                    window.location.href = response.url + '&cols=' + $cols.val() + '&rows=' + $rows.val();
                }).fail(function (message) {
                    $error.find('p').text(message);
                    $error.fadeIn();
                }).always(function () {
                    $loader.fadeOut();
                });
        };

        $input.on('focus', function () {
            $error.fadeOut();
        });

        $input.parents('form').on('submit', function (e) {
            e.preventDefault();

            buttonOkClick();
        });

        var $dialog = $('#addDialog').dialog({
            width: 480,
            modal: true,
            autoOpen: false,
            buttons: {
                Cancel: function () {
                    $dialog.dialog('close');
                },
                OK: buttonOkClick
            },
            close: function () {
                window.location.hash = '';
            }
        });

        $('.create-table').on('click', function () {
            $dialog.dialog('open');
        });

        $('.delete-table').on('click', function (e) {
            e.preventDefault();

            if (!confirm('Are you sure?')) {
                return;
            }

            var $btn = $(this);
            $btn.find('i')
                .removeClass('fa-trash-o')
                .addClass('fa-spin fa-circle-o-notch');

            app.request({
                module: 'tables',
                action: 'remove'
            }, {
                id: parseInt($btn.parents('tr').data('table-id'))
            }).done(function () {
                $btn.parents('tr').fadeOut(function () {
                    $(this).remove();

                    if ($tables.find('tr').length < 4) {
                        $tables.find('tr.empty').fadeIn();
                    }
                });
            }).fail(function (error) {
                $btn.find('i')
                    .removeClass('fa-spin fa-circle-o-notch')
                    .addClass('fa-trash-o');

                alert(error);
            });

            return false;
        });

        $(window).on('hashchange', function () {
            console.log('catched');
            if (window.location.hash === '#add') {
                $dialog.dialog('open');
            }
        }).trigger('hashchange');

        $('code').on('click', function () { window.prompt('Copy shortcode:', $.trim($(this).text())); });

        var tbNoticeDialog = function() {
            $('#reviewNotice').dialog({
                modal:    true,
                width:    600,
                autoOpen: true
            });
        };

        var tbShowReviewNotice = function() {

            var request = app.request({
                module: 'tables',
                action: 'checkReviewNoticeAction'
            });

            request.done(function (response) {
                if(response.show) {
                    tbNoticeDialog();

                    $('#reviewNotice [data-statistic-code]').on('click', function() {
                        var code = $(this).data('statistic-code');

                        app.request({
                            module: 'tables',
                            action: 'checkNoticeButton'
                        }).done(function(response) {
                            $('#reviewNotice').dialog('close');
                        });
                    });
                }
            });
        };

        tbShowReviewNotice();
    });

}(window.jQuery, window.supsystic.Tables));