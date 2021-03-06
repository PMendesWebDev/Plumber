﻿(() => {
    'use strict';    

    function comments() {

        const directive = {
            restrict: 'AEC',
            scope: {
                intro: '=',
                labelText: '=',
                comment: '=',
                limit: '=',
                isFinalApproval: '=',
                disabled: '='
            },
            templateUrl: '../app_plugins/workflow/backoffice/views/partials/workflowCommentsTemplate.html',
            link: scope => {

                scope.limitChars = () => {

                    var limit = scope.limit;

                    if (scope.comment.length > limit) {
                        scope.info = `(Comment max length exceeded - limit is ${limit} characters.)`;
                        scope.comment = scope.comment.substr(0, limit);
                    } else {
                        scope.info = `(${limit - scope.comment.length} characters remaining.)`;
                    }

                    if (!scope.isFinalApproval) {
                        scope.disabled = scope.comment.length === 0;
                    }
                };
            }
        };

        return directive;
    }

    angular.module('umbraco.directives').directive('wfComments', comments);

})();