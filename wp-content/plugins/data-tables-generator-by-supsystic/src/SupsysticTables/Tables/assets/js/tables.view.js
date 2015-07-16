(function ($, app, undefined) {

    $(document).ready(function () {

        var ace = window.ace.edit("css-editor");
        ace.setTheme("ace/theme/monokai");
        ace.getSession().setMode("ace/mode/css");

        function initializeEditor() {
            var container = document.getElementById('tableEditor');

            return new Handsontable(container, {
                colHeaders:            true,
                colWidths:             100,
                comments:              true,
                contextMenu:           true,
                formulas:              true,
                manualColumnResize:    true,
                manualRowResize:       true,
                mergeCells:            true,
                outsideClickDeselects: false,
                renderer:              'html',
                rowHeaders:            true,
                startCols:             app.getParameterByName('cols') || 5,
                startRows:             app.getParameterByName('rows') || 5
            });
        }

        function initializeTabs() {
            var $rows = $('.row-tab'),
                $buttons = $('.subsubsub .button');

            var current = $buttons.filter('.current')
                .attr('href');

            $rows.filter(current)
                .show();

            $buttons.on('click', function (e) {
                e.preventDefault();

                var $button = $(this),
                    current = $button.attr('href');

                $rows.hide();

                $buttons.filter('.current').removeClass('current');
                $button.addClass('current');
                $rows.filter(current).show();

                if (current === '#row-tab-editor') {
                    editor.render();
                } else if (current === '#row-tab-preview') {
                    var $container = $(current).find('#table-preview'),
                        $_previewTable = null,
                        $customCss = $('#table-custom-css');

                    if (!$customCss.length) {
                        $customCss = $('<style/>', { id: 'table-custom-css' });
                        $('head').append($customCss);
                    }

                    saveTable.call($container).done(function () {
                        app.Models.Tables.render(app.getParameterByName('id'))
                            .done(function (response) {
                                var $preview = $(response.table),
                                    table;

                                if ($_previewTable !== null) {
                                    $_previewTable.destroy();
                                }

                                $container.empty().append($preview);
                                table = $container.find('table');

                                $_previewTable = app.initializeTable(table);

                                table.on('draw.dt init.dt', function () {
                                    window.ruleJS($container.find('table').attr('id')).init();
                                });

                                table.trigger('init.dt');
                            });

                        $customCss.text(ace.getValue());
                    });
                }
            });
        }

        function saveTable() {
            var $loadable = $(this),
                defaultHtml = $loadable.html(),
                id = app.getParameterByName('id');

            $loadable.html(app.createSpinner());

            // Request to save settings.
            var settings = app.Models.Tables.request('saveSettings', {
                id: id,
                settings: $('form#settings').serialize()
            });

            // Request to save the table rows.
            var data = [];

            $.each(editor.getData(), function (x, rows) {
                var row = { cells: [] };

                $.each(rows, function (y, cell) {
                    var meta = editor.getCellMeta(x, y),
                        classes = [],
                        data = {
                            width:  editor.getColWidth(y),
                            hidden: editor.mergeCells.mergedCellInfoCollection.getInfo(x, y) !== undefined
                        };

                    if (meta.className !== undefined) {
                        $.each(meta.className.split(' '), function (index, element) {
                            if (element.length) {
                                classes.push($.trim(element));
                            }
                        });
                    }

                    if ('comment' in meta && meta.comment.length) {
                        data.comment = meta.comment;
                    }

                    data.data = cell;
                    data.meta = classes;

                    row.cells.push(data);
                });

                // Row height
                row.height = editor.getRowHeight(x);
                if (row.height === undefined || parseInt(row.height) < 10) {
                    row.height = null;
                }

                data.push(row);
            });

            var deferred = $.when(
                app.Models.Tables.setRows(id, data),
                app.Models.Tables.setMeta(id, {
                    mergedCells: editor.mergeCells.mergedCellInfoCollection,
                    css: ace.getValue()
                }),
                settings
            );

            return deferred.always(function () {
                $loadable.html(defaultHtml);
            });
        }

        initializeTabs();

        var editor, tableId = app.getParameterByName('id');
        editor = initializeEditor();

        /* DEBUG */
        window.editor = editor;

        var toolbar = new app.Editor.Toolbar('#tableToolbar', editor);
        toolbar.subscribe();

        var formula = new app.Editor.Formula(editor);
        formula.subscribe();

        var loading = $.when(
            //app.Models.Tables.getColumns(tableId),
            app.Models.Tables.getRows(tableId)
        );

        loading.done(function (/*c,*/ response) {
            var rows = response.rows,
                comments = [];

            if (rows.length > 0) {
                var data = [], meta = [], heights = [], widths = [];

                // Colors
                var $style = $('#supsystic-tables-style');

                if (!$style.length) {
                    $style = $('<style/>', { id: 'supsystic-tables-style' });
                    $('head').append($style);
                }

                $.each(rows, function (x, row) {
                    var cells = [];

                    heights.push(row.height);

                    $.each(row.cells, function (y, cell) {
                        cells.push(cell.data);

                        if ('meta' in cell && cell.meta !== undefined) {
                            var color = /color\-([0-9abcdef]{6})/.exec(cell.meta),
                                background = /bg\-([0-9abcdef]{6})/.exec(cell.meta);
                            
                            if (null !== color) {
                                $style.html($style.html() + ' .'+color[0]+' {color:#'+color[1]+'}');
                            }

                            if (null !== background) {
                                $style.html($style.html() + ' .'+background[0]+' {background:#'+background[1]+' !important}');
                            }

                            meta.push({ row: x, col: y, className: cell.meta });
                        }

                        if (x === 0) {
                            widths.push(cell.width === undefined ? 100 : cell.width);
                        }

                        if ('comment' in cell && cell.comment.length) {
                            comments.push({
                                col:     y,
                                row:     x,
                                comment: cell.comment
                            });
                        }

                    });

                    data.push(cells);
                });

                // Height & width
                editor.updateSettings({
                    rowHeights: heights,
                    colWidths: widths
                });

                // Load extracted data.
                editor.loadData(data);

                // Load extracted metadata.
                $.each(meta, function (i, meta) {
                    editor.setCellMeta(meta.row, meta.col, 'className', meta.className.join(' '));
                });

                // Comments
                // Note: comments need to be loaded after editor.loadData() call.
                if (comments.length) {
                    editor.updateSettings({
                        cell: comments
                    });
                }
            }

            editor.render();

            editor.addHook('afterRender', function () {
                var tableWidth = parseInt($(editor.rootElement).find('.ht_clone_top').width());

                // 50 = "f(x)" block width
                $('#formula').css({width: tableWidth - 50 });
            });

            app.Models.Tables.getMeta(app.getParameterByName('id')).done(function (response) {
                var meta = response.meta;

                if ('mergedCells' in meta && meta.mergedCells.length) {
                    editor.mergeCells = new Handsontable.MergeCells(meta.mergedCells);
                }

                editor.render();
            });

        }).fail(function (error) {
            alert('Failed to load table data: ' + error);
        }).always(function () {
            $('#loadingProgress').remove();
        });

        $('#buttonSave').on('click', function () {
            saveTable.call(this).fail(function (error) {
                alert('Failed to save table data: ' + error);
            });
        });

        $('#buttonDelete').on('click', function () {
            var $button = $(this),
                html = $button.html();

            if (!confirm('Are you sure?')) {
                return;
            }

            // Do loading animation inside the button.
            $button.html(app.createSpinner());

            app.Models.Tables.remove(app.getParameterByName('id'))
                .done(function () {
                    window.location.href = $('#menuItem_tables').attr('href');
                })
                .fail(function (error) {
                    alert('Failed to delete table: ' + error);
                })
                .always(function () {
                    $button.html(html);
                });
        });

        $('.table-title[contenteditable]').on('keydown', function (e) {
            if (!('keyCode' in e) || e.keyCode !== 13) {
                return;
            }

            var $heading = $(this),
                title = $heading.text();

            $heading.removeAttr('contenteditable')
                .html(app.createSpinner());

            app.Models.Tables.rename(app.getParameterByName('id'), title)
                .done(function () {
                    $heading.text(title);
                    $heading.attr('data-table-title', title);
                })
                .fail(function (error) {
                    $heading.text($heading.attr('data-table-title'));
                    alert('Failed to rename table: ' + error);
                });
        });

        $('[data-toggle="tooltip"]').tooltip();
    });

}(window.jQuery, window.supsystic.Tables));