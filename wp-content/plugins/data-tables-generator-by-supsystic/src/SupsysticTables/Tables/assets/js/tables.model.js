(function ($, app) {

    var TablesModel = (function () {
        function TablesModel() {}

        /**
         * Sends the request to the Tables module.
         * @param {string} action
         * @param {object} data
         * @returns {jQuery.Deferred.promise}
         */
        TablesModel.prototype.request = function (action, data) {
            return app.request({
                module: 'tables',
                action: action
            }, data);
        };

        /**
         * Removes table by id.
         * @param {int} id
         * @returns {jQuery.Deferred.promise}
         */
        TablesModel.prototype.remove = function (id) {
            if (isNaN(id = parseInt(id))) {
                throw new Error('Invalid table id.');
            }

            return this.request('remove', { id: id });
        };

        /**
         * Renames table.
         * @param {int} id
         * @param {string} title
         * @returns {jQuery.Deferred.promise}
         */
        TablesModel.prototype.rename = function (id, title) {
            if (isNaN(id = parseInt(id))) {
                throw new Error('Invalid table id.');
            }

            return this.request('rename', { id: id, title: title });
        };

        TablesModel.prototype.getColumns = function (id) {
            if (isNaN(id = parseInt(id))) {
                throw new Error('Invalid table id.');
            }

            return this.request('getColumns', { id: id });
        };

        TablesModel.prototype.setColumns = function (id, columns) {
            if (isNaN(id = parseInt(id))) {
                throw new Error('Invalid table id.');
            }

            return this.request('updateColumns', { id: id, columns: columns })
        };

        TablesModel.prototype.getRows = function (id) {
            if (isNaN(id = parseInt(id))) {
                throw new Error('Invalid table id.');
            }

            return this.request('getRows', { id: id });
        };

        TablesModel.prototype.setRows = function (id, rows) {
            if (isNaN(id = parseInt(id))) {
                throw new Error('Invalid table id.');
            }

            return this.request('updateRows', { id: id, rows: JSON.stringify(rows) });
        };

        TablesModel.prototype.setMeta = function (id, meta) {
            if (isNaN(id = parseInt(id))) {
                throw new Error('Invalid table id.');
            }

            return this.request('updateMeta', { id: id, meta: JSON.stringify(meta) });
        };

        TablesModel.prototype.getMeta = function (id) {
            if (isNaN(id = parseInt(id))) {
                throw new Error('Invalid table id.');
            }

            return this.request('getMeta', { id: id });
        };

        TablesModel.prototype.render = function (id) {
            if (isNaN(id = parseInt(id))) {
                throw new Error('Invalid table id.');
            }

            return this.request('render', { id: id });
        };

        return TablesModel;
    })();

    app.Models = app.Models || {};
    app.Models.Tables = new TablesModel();

}(window.jQuery, window.supsystic.Tables));