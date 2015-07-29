
var CRM_FORM_TYPE_CREATE = 1;
var CRM_FORM_TYPE_UPDATE = 2;

switch (Xrm.Page.ui.getFormType()) {
    case CRM_FORM_TYPE_CREATE:
        setSystemUserInterface();
        break;

    case CRM_FORM_TYPE_UPDATE:
        setEmailContactInterface();
        break;
}


function setSystemUserInterface() {
    // Set field to business required
    Xrm.Page.getAttribute("new_subscribedbyid").setRequiredLevel("required");
    // Set field to not required
    Xrm.Page.getAttribute("new_alias").setRequiredLevel("none");
}

function setEmailContactInterface() {
    // Set field to not required
    Xrm.Page.getAttribute("new_subscribedbyid").setRequiredLevel("none");
    // Set field to business required
    Xrm.Page.getAttribute("new_alias").setRequiredLevel("required");

}

//Event: onChange
//Field: new_subscribedbyid
if (Xrm.Page.getAttribute("new_subscribedbyid").getValue() != null) {
    var systemUserGuid = Xrm.Page.getAttribute("new_subscribedbyid").getValue()[0].id;
    var systemUser = getSystemUserInfo(systemUserGuid);

    Xrm.Page.getAttribute("new_alias").setValue(systemUser[0]);
    Xrm.Page.getAttribute("new_subscriberfirstname").setValue(systemUser[1]);
    Xrm.Page.getAttribute("new_subscriberlastname").setValue(systemUser[2]);
   
}

//Get System user's FirstName/LastName/Alias
function getSystemUserInfo(systemUserGuid) {
    var filter = "/SystemUserSet(guid'" + systemUserGuid + "')?$select=FirstName,LastName,New_Alias";
    
    var requestResults = ODATARetrieve(filter);   

    var userArray = new Array(3);
    if (requestResults.New_Alias)
        userArray[0] = requestResults.New_Alias;
    else
        userArray[0] = "";
    if (requestResults.FirstName)
        userArray[1] = requestResults.FirstName;
    else
        userArray[1] = "";
    if (requestResults.LastName)
        userArray[2] = requestResults.LastName;
    else
        userArray[2] = "";
    return userArray;

}

// ODATA Retrieve - Sync
function ODATARetrieve(filter) {
    var response = null;
    var serverUrl = Xrm.Page.context.getClientUrl() + "/XRMServices/2011/OrganizationData.svc";
    var ODATAUrl = serverUrl + filter;

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        async: false,
        url: ODATAUrl,
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, responseStatus, xmlHttpRequest) {
            if (data != null && data.d != null) {
                response = data.d;
            }
        },
        error: function (XmlHttpRequest, textStatus, errorThrown) {
            alert("Error: Failed to get subscriber user info.");
        }
    });
    return response;
}

