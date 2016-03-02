(function() {
    'use strict';

    /**
     *
     * @ngdoc module
     * @name dashboard
     * @module dashboard
     * @packageName dashboard
     * @description
     * Main module to display angular dashboard fluance.
     *
     **/
    angular.module('dashboard', []);
})();

/**
 * Mycockpit Directive
 */
(function() {
    'use strict';

    angular
        .module('dashboard')
        .directive('displayComponent', function() {
            return {
                restrict: 'E',
                scope: {
                    'component': '=',
                    'dashboard': '='
                },
                templateUrl: 'dashboard.component.directive.html',
                link: function(scope, element, attrs) {

                    scope.params = scope.component.params;
                    if (scope.component.scope) {
                        // angular.extend(scope, scope.component.scope);
                        // Break data binding :( needs to be fixed
                        scope.scope = scope.component.scope;
                    }

                    if (scope.component.states.default && scope.component.states.default.controller) {
                        scope.component.states.default.controller();
                    }

                    scope.openExtended = function(event) {
                        if (!scope.dashboard.isStateSorting) {
                            scope.dashboard.enableExtended();
                            scope.component.isExtended = true;
                            // Execute JS
                            if (scope.component.states.extended && scope.component.states.extended.controller) {
                                scope.component.states.extended.controller();
                            }
                        }
                    };
                    scope.closeExtended = function(event) {
                        if (!scope.dashboard.isStateSorting) {
                            scope.dashboard.isExtended = false;
                            scope.component.isExtended = false;
                            if (scope.component.states.default && scope.component.states.default.controller) {
                                scope.component.states.default.controller();
                            }
                        }
                    };
                    scope.openSettings = function(event) {
                        if (!scope.dashboard.isStateSorting) {
                            scope.component.displaySettings = true;
                            if (scope.component.states.settings && scope.component.states.settings.controller) {
                                scope.component.states.settings.controller();
                            }
                        }
                    };
                    scope.closeSettings = function(event) {
                        if (!scope.dashboard.isStateSorting) {
                            scope.component.displaySettings = false;
                            if (scope.component.states.default && scope.component.states.default.controller) {
                                scope.component.states.default.controller();
                            }
                        }
                    };
                }
            };
        });
})();

/**
 * Mycockpit Directive
 */
(function() {
    'use strict';

    angular
        .module('dashboard')
        .directive('dashboard', ['dashboardFactory', function(dashboardFactory) {

            // Width of the dashboard container
            var currentWidth;
            // To detet a change of column
            var lastNumberColumns;
            // Usually currentWidth / minWidth where max is numberMaxOfColumn
            var numberOfColumnPossible;
            // Width of columns in % to use in ng-style
            var columnsWidth;
            // Maximum number of columns
            var numberMaxOfColumn;
            // Thread to avoir too much event trigger during resize
            var timeout;

            return {
                restrict: 'E',
                scope: {
                    'id': '@',
                    'width': '@',
                    'columns': '@',
                    'columnsMinWidth': '@'
                },
                templateUrl: 'dashboard.directive.html',
                controller: ['$scope', function(scope) {
                    var screenWidth = $( window ).width();

                    scope.dashboard = dashboardFactory.get(scope.id);

                    scope.dashboard.setOptions({
                        'width': scope['width'],
                        'columns': scope['columns'],
                        'columnsMinWidth': scope['columnsMinWidth']
                    });

                    scope.dashboard.refresh();

                    // On resize we refresh
                    window.addEventListener('resize', function(event) {

                        if ($( window ).width() !== screenWidth) {
                            clearTimeout(timeout);
                            timeout = setTimeout(function () {
                                    scope.dashboard.refresh();
                                    scope.$apply();
                            }, 150);
                        }
                    }, true);
                }]
            };
        }]);
})();

(function() {
    'use strict';

    angular
        .module('dashboard')
        .factory('dashboardFactory', DashboardFactoryFunction);

    DashboardFactoryFunction.$inject = ['dashboardObject'];

    /**
     * @ngdoc service
     * @module dashboard
     * @name dashboardObject
     * @description
     *
     * This is a dashboard object. Allow you to create an object.
     *
     */
    function DashboardFactoryFunction(DashboardObject) {

        /**
         * This object store all dashboards, available by id.
         * @type {Object}
         */
        var store = {};

        var factory = {
            get: get,
            remove: remove,
            reinitialize: reinitialize
        };

        return factory;

        /**
         * Get a dashboard, based on its id
         * @param  {String} id [description]
         * @return {Object}    Index of dashbaords
         */
        function get(id) {
            if (!store[id]) {
                store[id] = new DashboardObject();
                store[id].id = id;
            }
            return store[id];
        }

        /**
         * Remove from a dashboard, based on its id
         * @param  {String} id [description]
         */
        function remove(id) {
            if (store[id]) {
                delete store[id];
            }
        }

        /**
         * Remove all dashboards from factory (used to reinitialize)
         */
        function reinitialize() {
            store = {};
        }

    }
})();

(function() {
    'use strict';

    angular
        .module('dashboard')
        .service('dashboardObject', DashboardObjectFunction);

    DashboardObjectFunction.$inject = ['$injector'];


    /**
     * @ngdoc service
     * @name dashboardObject
     * @description
     *
     * This is a dashboard object. Allow you to create an object.
     */
    function DashboardObjectFunction($injector) {

        /* jshint maxdepth: 10 */

        // Return a function to be used as new User();
        return function(params) {
            var DEFAULT_DASHBOARD = {
                // ID : string to identify a dashboard
                id: null,
                // auto_increment when add a component. To generate unique ID
                nbComponent: 0,
                // Used in template to know if dashboard is extended or not
                isExtended: false,
                // List of all component
                components: [],
                // Array of columns. Contain all component
                grid: [],

                // Define if dashboard is in sortable state
                isStateSorting: false, // Activate disable shaking state

                // This array contain list of sortable columns
                sortable: null, // Array of columns objects

                // Column width in pixel
                columnsWidth: null,

                // stored option to manage dashboard configuration.
                options: {
                    // Full width of entiere dashboard
                    'width': 'auto',
                    // Number of columns in dashboard
                    'columns': '2',
                    // Min widht of columns.
                    'columnsMinWidth': null,
                    // Enable/disable sorting
                    'sortable': true,
                    // Algorithm to define where to put component if no column
                    // can be shorter, or Random
                    'algo': 'shorter'
                },

                /**
                 * List of function to add
                 */
                add: add,
                setOptions: setOptions,
                toString: toString,
                fromString: fromString,
                enableExtended: enableExtended,
                disableExtended: disableExtended,
                refresh: refresh,
                toggleSortable: toggleSortable
            };

            var instance = DEFAULT_DASHBOARD;

            var lastNumberColumns, maxAllowColumns;

            return instance;


            /**
             * Add a component in array
             * @param {Object} component    Dashboard component
             * @param {integer} column      Column number, starting at zero
             */
            function add(component) {

                // Define component ID
                component.id = instance.id + '-' + instance.nbComponent;
                instance.nbComponent++;
                // Add in list
                instance.components.push(component);

                return component;
            }

            /**
             * Refresh dashboard grid layout. Used for exemple on resize event to
             * redefine column number.
             * @return {[type]} [description]
             */
            function refresh() {

                // Define options shortcut
                var options = instance.options;

                // If is on sorting mode, we stop it
                if (instance.isStateSorting) {
                    instance.toggleSortable();
                }

                //
                // Redefine grid layout
                //
                var currentWidth = $('#' + instance.id).parent().width();

                // If screen smaller than expected width, we take size
                if (options.width !== 'auto' &&
                    options.width < currentWidth) {
                    currentWidth = options.width;
                }

                // instance.options.width = currentWidth;

                var numberOfColumnPossible = parseInt(currentWidth / options.columnsMinWidth);
                numberOfColumnPossible = (numberOfColumnPossible ? numberOfColumnPossible : 1);

                if (numberOfColumnPossible > maxAllowColumns) {
                    numberOfColumnPossible = maxAllowColumns;
                }
                if (lastNumberColumns !== numberOfColumnPossible) {
                    lastNumberColumns = numberOfColumnPossible;
                    // Case 1, we make them float
                    if (numberOfColumnPossible < options.columns) {
                        instance.columnsWidth = (100 / numberOfColumnPossible) + '%';
                    } else if (numberOfColumnPossible > options.columns) {
                        instance.columnsWidth = (100 / numberOfColumnPossible) + '%';
                    } else {
                        instance.columnsWidth = (100 / options.columns) + '%';
                    }
                }
                // If numberOfColumnPossible === 0 then 1 is minimim number of possible column
                options.columns = numberOfColumnPossible;
                //
                // Dispatch component in new grid layout.
                //
                instance.grid = [];
                for (var i = options['columns'] - 1; i >= 0; i--) {
                    instance.grid[i] = [];
                }

                instance.sortable = null;
                // For each component, we define its position and inject it in our grid object.
                // Grid is displayed in DOM by dashboard.directive.js
                instance.components.forEach(function(component) {

                    var column = 0,
                        position = 0;
                    var nbColumn = options['columns'];

                    // Check if position is define
                    if (component.positions && component.positions[nbColumn]) {
                        column = component.positions[nbColumn]['column'];
                        position = component.positions[nbColumn]['position'];
                    } else {

                        // We use algo to define component position
                        if (options['algo'] === 'shorter') {
                            // For each column starting by the end, we check size
                            for (var i = options['columns'] - 1; i >= 0; i--) {
                                // if column i in grid does not exist
                                if (!instance.grid[i]) {
                                    column = i;
                                    instance.grid[i] = [];
                                } else {
                                    // Si it exist
                                    if (instance.grid[i].length <= instance.grid[column].length) {
                                        column = i;
                                    }
                                }
                            }
                        } else if (options['algo'] === 'random') {
                            column = Math.floor(Math.random() * options['columns']);
                        } else {
                            column = 0;
                        }

                        // define position of defined column. Get last position.
                        if (instance.grid[column]) {
                            position = instance.grid[column].length;
                        }

                        // We save new position in our
                        if (!component.positions) {
                            component.positions = {};
                        }
                        component.positions[nbColumn] = {};
                        component.positions[nbColumn]['column'] = column;
                        component.positions[nbColumn]['position'] = position;
                    }

                    // If grid never used this column before, create one.
                    if (!instance.grid[column]) {
                        instance.grid[column] = [];
                    }
                    // Add compoment in grid to defined position
                    instance.grid[column].splice(position, 0, component);

                });
            }

            /**
             * Set dashboard options.
             */
            function setOptions(newOptions) {
                // For each new option we override current one.
                Object.keys(newOptions).forEach(function(key) {
                    if (newOptions[key]) {
                        instance.options[key] = newOptions[key];
                        // If edit columns, we save as maxAllowColumns
                        if (key === 'columns') {
                            maxAllowColumns = newOptions[key];
                        }
                    }
                });
            }

            /**
             * Convert the dashboard to a String
             * @return {String} Dashboard as a String
             */
            function toString() {
                var componentList = [];

                // For each column in grid
                instance.grid.forEach(function(column) {
                    column.forEach(function(component) {
                        componentList.push({
                            name: component.name,
                            params: component.params,
                            positions: component.positions
                        });
                    });
                });

                return JSON.stringify(componentList);
            }

            /**
             * Create a dashboard from a String
             * @param  {String} dashboardString Dashboard as a String
             */
            function fromString(dashboardString) {
                var componentList = JSON.parse(dashboardString);
                var nbColumns = 0;

                componentList.forEach(function(component) {
                    if ($injector.has(component.name)) {
                        var componentObject = add(new $injector.get(component.name)(component.params));
                        componentObject.positions = component.positions;
                    }
                });
            }

            // Apply drag/drop to angular MVC (alias grid object)
            function sortAllComponents(evt) {

                // Identify columns
                var oldColumn = evt.from.id.replace('column', '');
                var newColumn = evt.to.id.replace('column', '');

                // Get component as tmp
                var component = instance.grid[oldColumn][evt.oldIndex];
                // Remove old component
                instance.grid[oldColumn].splice(evt.oldIndex, 1);

                // Update component position
                //
                var nbColumn = instance.options['columns'];

                component.positions[nbColumn].column = newColumn;

                // Add component to new location
                instance.grid[newColumn].splice(evt.newIndex, 0, component);

                // Update old position index
                instance.grid[oldColumn].forEach(function(component, index) {
                    component.positions[nbColumn].column = parseInt(oldColumn);
                    component.positions[nbColumn].position = parseInt(index);
                });

                // Update new position index
                instance.grid[newColumn].forEach(function(component, index) {
                    component.positions[nbColumn].column = parseInt(newColumn);
                    component.positions[nbColumn].position = parseInt(index);
                });

            }

            /**
             * Apply Sortable to HTML and make it draggable/droppable
             */
            function makeItSortable() {

                // If columns have already been initialize
                if (!instance.sortable) {
                    instance.sortable = [];

                    // apply sortable on each column.
                    for (var i = 0; i < instance.grid.length; i++) {

                        instance.sortable.push(
                            Sortable.create(document.getElementById('column' + i), {
                                group: instance.id,
                                draggable: '.component',
                                disabled: !instance.isStateSorting, // No databinding here, need to be updated
                                handle: '.sortable-handle',
                                scroll: true,
                                scrollSensitivity: 30, // px, how near the mouse must be to an edge to start scrolling.
                                scrollSpeed: 10, // px
                                onAdd: function(evt) {
                                    // Event triggered when add in column
                                    sortAllComponents(evt);
                                },
                                onUpdate: function(evt) {
                                    // event triggered when column is changed
                                    sortAllComponents(evt);
                                }
                            })
                        );
                    }
                }
            }

            /**
             * This function enable/disable sorting state of dashboard
             */
            function toggleSortable() {
                // If dashboard is sortable by user
                if (!instance.options['sortable']) {
                    console.log('This dashboard does not allow sorting (see options configuration).');
                } else {
                    makeItSortable();
                    // Toggle sorting state
                    instance.isStateSorting = !instance.isStateSorting;
                    // Change disable option for each column
                    instance.sortable.forEach(function(sort) {
                        sort.option('disabled', !instance.isStateSorting);
                    });
                }
            }

            function enableExtended() {
                instance.isExtended = true;
            }

            /**
             * This function disable extended dashboard to make it as default
             */
            function disableExtended() {
                instance.isExtended = false;

                instance.components.forEach(function(component) {
                    if (component.isExtended) {
                        component.isExtended = false;
                    }
                });
            }
        };
    }
})();

angular.module("dashboard").run(["$templateCache", function($templateCache) {$templateCache.put("dashboard.component.directive.html","<div id=\"component.id\" class=\"dashboard-component\"><div class=\"default\" data-ng-include=\"component.states.default.template\" data-ng-if=\"!dashboard.isExtended && !component.displaySettings\"></div><div class=\"extended\" data-ng-include=\"component.states.extended.template\" data-ng-if=\"component.isExtended\"></div><div class=\"settings\" data-ng-include=\"component.states.settings.template\" data-ng-if=\"component.displaySettings && !dashboard.isExtended\"></div></div>");
$templateCache.put("dashboard.directive.html","<div id=\"dashboard-{{ id }}\" class=\"dashboard-container\" data-ng-style=\"{ \'width\': dashboard.options.width }\"><div id=\"column{{$index+0}}\" class=\"dashboard-column\" data-ng-class=\"{ \'placeholder\' : dashboard.isStateSorting, \'shake-effect\': dashboard.isStateSorting }\" data-ng-repeat=\"column in dashboard.grid\" data-ng-style=\"{ \'max-width\': dashboard.columnsWidth, \'width\': dashboard.columnsWidth }\"><div class=\"component\" data-ng-repeat=\"component in column\"><display-component component=\"component\" dashboard=\"dashboard\"></display-component></div></div><div class=\"clearfix\"></div></div>");}]);