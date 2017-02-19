﻿using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using Umbraco.Core;
using Umbraco.Core.Persistence;
using Umbraco.Core.Services;
using Umbraco.Web.WebApi;
using Workflow.Models;

namespace Workflow.Api
{
    public class WorkflowController : UmbracoAuthorizedApiController
    {
        private static readonly ILog log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private static Database db = ApplicationContext.Current.DatabaseContext.Database;
        private static PocoRepository _pr = new PocoRepository();
        private IUserService _us = ApplicationContext.Current.Services.UserService;

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [System.Web.Http.HttpGet]
        public HttpResponseMessage GetSettings()
        {
            var wsp = new WorkflowSettingsPoco();        
            var settings = db.Fetch<WorkflowSettingsPoco>("SELECT * FROM WorkflowSettings");

            if (settings.Any())
            {
                wsp = settings.First();
            } else
            {
                db.Insert(wsp);
                wsp = db.Fetch<WorkflowSettingsPoco>("SELECT * FROM WorkflowSettings").First();
            }

            return Request.CreateResponse(HttpStatusCode.OK, wsp);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [System.Web.Http.HttpPost]
        public HttpResponseMessage SaveSettings(WorkflowSettingsPoco model)
        {
            db.Update(model);            
            return Request.CreateResponse(HttpStatusCode.OK, "Settings updated");
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [System.Web.Http.HttpGet]
        public HttpResponseMessage GetStatus(int nodeId)
        {
            var instances = _pr.InstancesByNodeAndStatus(nodeId, new List<int> { (int)WorkflowStatus.PendingCoordinatorApproval, (int)WorkflowStatus.PendingFinalApproval });

            if (instances.Any())
            {
                return Request.CreateResponse(HttpStatusCode.OK, new { msg = "This node is currently in a workflow", status = 0 });
            }

            return Request.CreateResponse(HttpStatusCode.OK, new { msg = string.Empty, status = 1 });
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="nodeId"></param>
        /// <param name="authorId"></param>
        /// <param name="comment"></param>
        /// <returns></returns>
        [System.Web.Http.HttpPost]
        public HttpResponseMessage InitiateWorkflow(string nodeId, string comment, bool publish)
        {
            WorkflowInstancePoco instance = null;
            TwoStepApprovalProcess process = null;

            try
            {
                if (publish)
                {
                    process = new DocumentPublishProcess();
                }
                else
                {
                    process = null;
                }

                instance = process.InitiateWorkflow(int.Parse(nodeId), Helpers.GetCurrentUser().Id, comment);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Something went wrong " + e.Message );
            }

            if (instance != null)
            {
                var msg = string.Empty;

                switch (instance._Status)
                {
                    case WorkflowStatus.PendingCoordinatorApproval:
                        msg = "Page submitted for coordinator approval";
                        break;
                    case WorkflowStatus.PendingFinalApproval:
                        msg = "Page submitted for final approval";
                        break;
                    case WorkflowStatus.Completed:
                        msg = "Workflow complete";
                        break;
                }
                return Request.CreateResponse(HttpStatusCode.OK, msg);
            }

            return Request.CreateResponse(HttpStatusCode.BadRequest, "Something went wrong");
        }
    }
}
