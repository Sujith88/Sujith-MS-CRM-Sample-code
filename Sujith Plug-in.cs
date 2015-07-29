using System;
using Microsoft.Xrm.Sdk;
using System.ServiceModel;

namespace LGS.CRM.Plugins
{
    /// <summary>
    /// Add Admin security role to team
    /// </summary>
    public class AddTeamDefaultRole : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // Obtain the execution context from the service provider.
            Microsoft.Xrm.Sdk.IPluginExecutionContext context = (Microsoft.Xrm.Sdk.IPluginExecutionContext)
            serviceProvider.GetService(typeof(Microsoft.Xrm.Sdk.IPluginExecutionContext));

            // The InputParameters collection contains all the data passed in the message request.
            if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity && context.MessageName == "Create")
            {
                // Obtain the target entity id from the output parmameters.
                Guid id = new Guid(context.OutputParameters["id"].ToString());

                IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
                AssignAdminRole(service, id);

            }
        }
        private void AssignAdminRole(IOrganizationService service, Guid id)
        {
            string adminRoleName = "System Administrator";
            try
            {
                QueryExpression query = new QueryExpression
                {
                    EntityName = "role",
                    ColumnSet = new ColumnSet("name"),
                    Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression
                        {
                                AttributeName = "name",
                                Operator = ConditionOperator.Equal,
                                Values = {adminRoleName}
                        }
                    }
                }
                };
                EntityCollection roles = service.RetrieveMultiple(query);
                EntityReferenceCollection entityRefCln = new EntityReferenceCollection();
                foreach (Entity entity in roles.Entities)
                {
                        entityRefCln.Add(entity.ToEntityReference());
                }
                service.Associate("team", id, new Relationship("teamroles_association"), entityRefCln);
            }
            catch (Exception ex)
            {

            }
        }
    }

}
