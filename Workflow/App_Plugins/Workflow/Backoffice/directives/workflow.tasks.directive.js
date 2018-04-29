﻿(() => {
    'use strict';

    function tasks($location, userService, workflowActionsService) {

        const directive = {
            restrict: 'AEC',
            scope: {
                items: '=',
                type: '=',
                loaded: '='
            },
            templateUrl: '../app_plugins/workflow/backoffice/partials/workflowTasksTemplate.html',
            controller: function ($scope) {

                // type = 0, 1
                // 0 -> full button set
                // 1 -> cancel, edit - this is reversed if the task is rejected
                const buttons = {
                    approveButton: {
                        labelKey: 'workflow_approveButton',
                        handler: item => {
                            $scope.$parent.vm.workflowOverlay = workflowActionsService.action(item, 'Approve', true);
                        }
                    },
                    editButton: {
                        labelKey: 'workflow_editButton',
                        handler: item => {
                            $location.path(`/content/content/edit/${item.nodeId}`);
                        }
                    },
                    cancelButton: {
                        labelKey: 'workflow_cancelButton',
                        cssClass: 'danger',
                        handler: item => {
                            $scope.$parent.vm.workflowOverlay = workflowActionsService.cancel(item, true);
                        }
                    },                
                    rejectButton: {
                        labelKey: 'workflow_rejectButton',
                        cssClass: 'warning',
                        handler: item => {
                            $scope.$parent.vm.workflowOverlay = workflowActionsService.action(item, 'Reject', true);
                        }
                    }
                };

                const subButtons = [
                    [buttons.editButton, buttons.rejectButton, buttons.cancelButton],
                    [buttons.editButton],
                    [buttons.cancelButton]
                ];

                $scope.buttonGroup = {
                    defaultButton: $scope.type === 0 ? buttons.approveButton : buttons.cancelButton,
                    subButtons: subButtons[$scope.type]
                };

                // when the items arrive, if it's my subs or admin list, and the last task was rejected
                // flip the order of the cancel and edit buttons
                $scope.$watch('items',
                    newVal => {
                        if (newVal.length && $scope.type === 1) {
                            const currentTask = newVal[newVal.length - 1];

                            if (currentTask.cssStatus === 'rejected') {

                                userService.getCurrentUser()
                                    .then(userResp => {
                                        if (userResp.id === currentTask.requestedById) {
                                            $scope.buttonGroup.defaultButton = buttons.editButton;
                                            $scope.buttonGroup.subButtons = [buttons.cancelButton];
                                        }
                                    });
                            }
                        }
                    });
            }
        };

        return directive;
    }

    angular.module('umbraco.directives').directive('wfTasks', ['$location', 'userService', 'plmbrActionsService', tasks]);

})();
