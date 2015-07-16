(function ($, app, undefined) {

    var Formula = (function () {
        function Formula(editor) {
            var input = $('#formula');

            this.getInput = function () {
                return input;
            };

            this.getEditor = function () {
                return editor;
            }
        }

        Formula.prototype.getValue = function () {
            return this.getInput().val();
        };

        Formula.prototype.setValue = function (value) {
            this.getInput().val(value);
        };

        Formula.prototype.getSupportedFormulas = function () {
            if (ruleJS() === undefined) {
                return null;
            }

            return ruleJS().helper.SUPPORTED_FORMULAS;
        };

        Formula.prototype.subscribe = function () {
            this.getEditor().addHook('afterSelection', $.proxy(function () {
                var range = this.getEditor().getSelectedRange();

                this.setValue(
                    this.getEditor().getDataAtCell(
                        range.highlight.row,
                        range.highlight.col
                    )
                );
            }, this));

            this.getInput().on('focus', $.proxy(function () {
                if(undefined === this.getEditor().getSelectedRange()) {
                    this.getEditor().selectCell(0, 0);
                }
            }, this));

            this.getInput().on('input change keyup', $.proxy(function () {
                var range = this.getEditor().getSelectedRange();

                this.getEditor().setDataAtCell(
                    range.highlight.row,
                    range.highlight.col,
                    this.getValue()
                )
            }, this));

            this.getInput().autocomplete({
                source: $.map(this.getSupportedFormulas(), function (formula) {
                    return '=' + formula;
                })
            });
        };

        return Formula;
    })();

    app.Editor = app.Editor || {};
    app.Editor.Formula = Formula;

}(window.jQuery, window.supsystic.Tables));