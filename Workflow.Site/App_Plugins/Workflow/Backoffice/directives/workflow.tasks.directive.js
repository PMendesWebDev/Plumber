﻿(function () {
    'use strict';

    function TasksDirective(dialogService, notificationsService) {

        var directive = {
            restrict: 'AEC',
            scope: {
                heading: '=',
                items: '=',
                type: '=',
                loaded: '='
            },
            templateUrl: '../app_plugins/workflow/backoffice/partials/workflowTasksTemplate.html',
            controller: function ($scope, $rootScope) {

                // type = 0, 1
                // 0 -> full button set
                // 1 -> cancel, edit
                var buttons = {
                    approveButton: {
                        labelKey: "workflow_approveButton",
                        handler: function (item) {
                            $rootScope.$broadcast('workflow-action', { item: item, approve: true });
                        }
                    },
                    editButton: {
                        labelKey: "workflow_editButton",
                        href: '/umbraco/#/content/content/edit/'
                    },
                    cancelButton: {
                        labelKey: "workflow_cancelButton",
                        cssClass: 'danger',
                        handler: function (item) {
                            $rootScope.$broadcast('workflow-cancel', item);
                        }
                    },                
                    rejectButton: {
                        labelKey: "workflow_rejectButton",
                        cssClass: 'warning',
                        handler: function (item) {
                            $rootScope.$broadcast('workflow-action', { item: item, approve: false });
                        }
                    }
                };

                var subButtons = [
                    [buttons.editButton, buttons.rejectButton, buttons.cancelButton],
                    [buttons.editButton]
                ]

                $scope.buttonGroup = {
                    defaultButton: $scope.type === 0 ? buttons.approveButton : buttons.cancelButton,
                    subButtons: subButtons[$scope.type]
                };
            }
        };

        return directive;
    }

    angular.module('umbraco.directives').directive('wfTasks', TasksDirective);

}());