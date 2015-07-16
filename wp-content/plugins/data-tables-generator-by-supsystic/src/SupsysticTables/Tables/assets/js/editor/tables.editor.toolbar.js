(function ($, app, undefined) {

    var classRegExp = /current|area|selected|formula|^\s+|\s+$/gi;

    var getValidRange = function (range) {
        if (range === undefined) {
            return undefined;
        }

        var startRow = range.from.row,
            endRow = range.to.row,
            startCol = range.from.col,
            endCol = range.to.col;

        if (startRow > endRow) {
            startRow = range.to.row;
            endRow = range.from.row;
        }

        if (startCol > endCol) {
            startCol = range.to.col;
            endCol = range.from.col;
        }

        return {
            from: {
                col: startCol,
                row: startRow
            },
            to: {
                col: endCol,
                row: endRow
            }
        }
    };

    var toggleClass = function (editor, className) {
        var range = getValidRange(editor.getSelectedRange());

        if (range === undefined) {
            return;
        }

        for (var row = range.from.row; row <= range.to.row; row++) {
            for (var col = range.from.col; col <= range.to.col; col++) {
                var cell = $(editor.getCell(row, col));

                cell.toggleClass(className.replace(/^\s+|\s+$/g, ''));

                editor.setCellMeta(
                    row,
                    col,
                    'className',
                    cell.attr('class').replace(/current|area|selected|^\s+|\s+$/gi, '')
                );
            }
        }
    };

    var replaceClass = function (editor, className, replace) {
        var range = getValidRange(editor.getSelectedRange());

        if (range === undefined) {
            return;
        }

        for (var row = range.from.row; row <= range.to.row; row++) {
            for (var col = range.from.col; col <= range.to.col; col++) {
                var cell = $(editor.getCell(row, col));

                cell.removeClass(function (index, className) {
                    if ($.isArray(replace)) {
                        return replace.join(' ');
                    }

                    if ($.isFunction(replace)) {
                        return replace(className);
                    }

                    return replace;
                });

                cell.addClass(className.replace(/^\s+|\s+$/g, ''));

                editor.setCellMeta(
                    row,
                    col,
                    'className',
                    cell.attr('class').replace(classRegExp, '')
                );
            }
        }
    };

    var removeClass = function (editor, className) {
        var range = getValidRange(editor.getSelectedRange());

        if (range === undefined) {
            return;
        }

        for (var row = range.from.row; row <= range.to.row; row++) {
            for (var col = range.from.col; col <= range.to.col; col++) {
                var cell = $(editor.getCell(row, col));

                cell.attr(
                    'class',
                    cell.attr('class')
                        .replace(className, '')
                        .replace(/^\s+|\s+$/g, "")
                );

                editor.setCellMeta(
                    row,
                    col,
                    'className',
                    cell.attr('class').replace(classRegExp, '')
                );
            }
        }
    };

    var methods = {
        bold: function () {
            toggleClass(this.getEditor(), 'bold');

            this.getEditor().render();
        },
        italic: function () {
            toggleClass(this.getEditor(), 'italic');

            this.getEditor().render();
        },
        left: function () {
            replaceClass(this.getEditor(), 'htLeft', ['htRight', 'htCenter']);

            this.getEditor().render();
        },
        right: function () {
            replaceClass(this.getEditor(), 'htRight', ['htLeft', 'htCenter']);

            this.getEditor().render();
        },
        center: function () {
            replaceClass(this.getEditor(), 'htCenter', ['htLeft', 'htRight']);

            this.getEditor().render();
        },
        top: function () {
            replaceClass(this.getEditor(), 'htTop', ['htMiddle', 'htBottom']);

            this.getEditor().render();
        },
        middle: function () {
            replaceClass(this.getEditor(), 'htMiddle', ['htTop', 'htBottom']);

            this.getEditor().render();
        },
        bottom: function () {
            replaceClass(this.getEditor(), 'htBottom', ['htTop', 'htMiddle']);

            this.getEditor().render();
        },
        row: function () {
            this.getEditor().alter('insert_row');
        },
        column: function () {
            this.getEditor().alter('insert_col');
        },
        remove_row: function () {
            var selection = this.getEditor().getSelectedRange();

            if (selection === undefined) {
                return;
            }

            var amount = selection.to.row - selection.from.row + 1,
                selected = this.getEditor().getSelected(),
                entireColumnSelection = [0, selected[1], this.getEditor().countRows() - 1, selected[1]],
                columnSelected = entireColumnSelection.join(',') == selected.join(',');

            if (selected[0] < 0 || columnSelected) {
                return;
            }

            this.getEditor().alter('remove_row', selection.from.row, amount);
        },
        remove_col: function () {
            var selection = this.getEditor().getSelectedRange();

            if (selection === undefined) {
                return;
            }

            var amount = selection.to.col - selection.from.col + 1,
                selected = this.getEditor().getSelected(),
                entireRowSelection = [selected[0], 0, selected[0], this.getEditor().countCols() - 1],
                rowSelected = entireRowSelection.join(',') == selected.join(',');

            if (selected[1] < 0 || rowSelected) {
                return;
            }
            
            this.getEditor().alter("remove_col", selection.from.col, amount);
        },
        color: function (color) {
            var $style = $('#supsystic-tables-style');

            if (!$style.length) {
                $style = $('<style/>', { id: 'supsystic-tables-style' });

                $('head').append($style);
            }

            $style.html($style.html() + ' .color-'+color+' {color:#'+color+'}');

            removeClass(this.getEditor(), /color\-([0-9a-f]{6})/gi);
            toggleClass(this.getEditor(), 'color-' + color);

            this.getEditor().render();
        },
        background: function (color) {
            if (color === 'ffffff') {
                removeClass(this.getEditor(), new RegExp('bg\-([0-9abcdef]{6})'));

                return;
            }

            var $style = $('#supsystic-tables-style');

            if (!$style.length) {
                $style = $('<style/>', { id: 'supsystic-tables-style' });

                $('head').append($style);
            }

            $style.html($style.html() + ' .bg-'+color+' {background:#'+color+' !important}');

            removeClass(this.getEditor(), /bg\-([0-9a-f]{6})/gi);
            toggleClass(this.getEditor(), 'bg-'+color);

            this.getEditor().render();
        },
        link: function () {
            var selection = this.getEditor().getSelectedRange(),
                highlighted = selection === undefined ? { col: 0, row: 0 } : selection.highlight,
                url,
                text,
                cellData;

            url = prompt('Enter the URL:', 'http://');
            if (null === url) {
                return;
            }

            text = prompt('Enter text:', this.getEditor().getDataAtCell(highlighted.row, highlighted.col));
            if (null === text) {
                return;
            }


            this.getEditor().setDataAtCell(highlighted.row, highlighted.col, '<a href="'+ url +'">' + text + '</a>');
        },
        picture: function () {
            var selection = this.getEditor().getSelectedRange(),
                highlighted = selection === undefined ? { col: 0, row: 0 } : selection.highlight,
                url;

            url = prompt('Enter URL to the picture:', 'http://');

            if (null === url) {
                return;
            }

            this.getEditor().setDataAtCell(highlighted.row, highlighted.col, '<img src="' + url + '"/>');
        }
    };

    var Toolbar = (function () {
        function Toolbar(toolbarId, editor) {
            var $container = $(toolbarId);

            this.getContainer = function () {
                return $container;
            };

            this.getEditor = function () {
                return editor;
            }
        }

        Toolbar.prototype.subscribe = function () {
            var self = this;

            this.getContainer().find('button, .toolbar-content > a').each(function () {
                var $button = $(this);

                if ($button.data('method') !== undefined && methods[$button.data('method')] !== undefined) {
                    var method = $button.data('method');

                    $button.on('click', function (e) {
                        e.preventDefault();

                        methods[method].apply(self);
                    });
                }

                var $textColor = $('#textColor').ColorPicker({
                    onChange: function (hsb, hex, rgb) {
                        self.call('color', hex);
                    }
                });

                var $bgColor = $('#bgColor').ColorPicker({
                    onChange: function (hsb, hex, rgb) {
                        self.call('background', hex);
                    }
                });

                self.getEditor().addHook('afterSelection', function (startRow, startCol, endRow, endCol) {
                    if (startRow !== endRow || startCol !== endCol) {
                        return;
                    }

                    var cell = self.getEditor().getCell(startRow, startCol),
                        color = /color\-([0-9abcdef]{6})/.exec(cell.className),
                        background = /bg\-([0-9abcdef]{6})/.exec(cell.className);
                    
                    if (null !== color) {
                        $textColor.css({borderBottomColor: '#'+color[1]});
                    } else {
                        $textColor.css({borderBottomColor: 'transparent'});
                    }

                    if (null !== background && background[1] !== 'ffffff') {
                        $bgColor.css({borderBottomColor: '#'+background[1]});
                    } else {
                        $bgColor.css({borderBottomColor: 'transparent'});
                    }
                });
            });

            this.getContainer().find('button').each(function () {
                var $button = $(this);

                if ($button.data('toolbar') !== undefined) {
                    $button.toolbar({
                        content: $button.data('toolbar'),
                        position: 'bottom',
                        hideOnClick: true
                    });
                }
            });
        };

        Toolbar.prototype.call = function (method) {
            if (methods[method] === undefined) {
                throw new Error('The method "' + method + '" is not exists.');
            }

            methods[method].apply(this, Array.prototype.slice.call(arguments, 1, arguments.length));
        };

        return Toolbar;
    })();

    app.Editor = app.Editor || {};
    app.Editor.Toolbar = Toolbar;

}(window.jQuery, window.supsystic.Tables || {}));