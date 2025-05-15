using System;
using System.Data;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Boilerplate.Constants;
using Boilerplate.Contracts;
using Boilerplate.Exceptions;
using Boilerplate.Services;
using Fabric_Extension_BE_Boilerplate.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Fabric_Extension_BE_Boilerplate.Controllers
{
    public class KqlDatabaseController : ControllerBase
    {
        private readonly ILogger<KqlDatabaseController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuthenticationService _authenticationService;
        private readonly HttpClient _httpClientService;

        public KqlDatabaseController(
            ILogger<KqlDatabaseController> logger,
            IHttpContextAccessor httpContextAccessor,
            IAuthenticationService authenticationService)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _authenticationService = authenticationService;
            _httpClientService = new HttpClient();
        }

        /// <summary>
        /// Executes a KQL query against a specified database.
        /// In order for this method to succeed, the caller must have the appropriate permissions to access the KQL data base.
        /// Permissions and scopes are defined in Entra ID application. For this request the scope is: KQLDatabase.ReadWrite.All
        /// For more information please follow the link:
        /// https://learn.microsoft.com/en-us/fabric/workload-development-kit/fabric-data-plane#api-permissions
        /// </summary>
        /// <param name="request">The request containing the query details.</param>
        /// <returns>An IActionResult containing the query results or an error message.</returns>
        /// <remarks>
        /// This endpoint authenticates the user, constructs an HTTP request to the KQL service, and processes the response.
        /// If the query is successful, the results are returned as a DataTable.
        /// If the query fails, an appropriate error message is returned.
        /// </remarks>
        [HttpPost("KqlDatabases/query")]
        public async Task<IActionResult> QueryKqlDatabase([FromBody] QueryKqlDatabaseRequest request)
        {
            var authorizationContext = await _authenticationService.AuthenticateDataPlaneCall(_httpContextAccessor.HttpContext, allowedScopes: new string[] { WorkloadScopes.KQLDatabaseReadWriteAll });
            var scopes = new[] { $"{request.QueryServiceUri}/user_impersonation" };
            var token = await _authenticationService.GetAccessTokenOnBehalfOf(authorizationContext, scopes);

            var requestMessage = CreateHttpRequestMessage(request, token);

            var response = await _httpClientService.SendAsync(requestMessage);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var dataTable = ConvertJsonToDataTable(responseContent, requestMessage.RequestUri.ToString());
                return Ok(dataTable);
            }
            else
            {
                var errorResponseJson = await response.Content.ReadAsStringAsync();
                var errorResponse = JObject.Parse(errorResponseJson);
                var errorType = errorResponse["error"]?["@type"]?.ToString();
                var errorMessage = errorResponse["error"]?["message"]?.ToString() ?? "An unknown error occurred.";

                if (errorType == "Kusto.Data.Exceptions.SemanticException")
                {
                    throw new KustoDataException(errorMessage);
                }
                else
                {
                    return StatusCode((int)response.StatusCode, errorMessage);
                }
            }
        }

        private HttpRequestMessage CreateHttpRequestMessage(QueryKqlDatabaseRequest request, string token)
        {
            var url = request.QueryServiceUri;
            var dbName = request.DatabaseName;
            var query = request.Query;

            if (request.Query[0] == '.')
            {
                // Query starting with '.' is a management or command query
                url = url + "/v1/rest/mgmt";
            }
            else
            {
                url = url + "/v2/rest/query";
            }

            var body = new
            {
                db = dbName,
                csl = query,
                properties = new
                {
                    Options = new
                    {
                        servertimeout = "60s",
                        enableprogressivequery = true
                    }
                }
            };

            var convertedBody = JsonConvert.SerializeObject(body);
            var mycontent = new StringContent(convertedBody, Encoding.UTF8, "application/json");

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = mycontent
            };
            requestMessage.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            requestMessage.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            requestMessage.Headers.Add(HttpHeaders.RequestId, GetRequestIdHeader() ?? Guid.NewGuid().ToString());
            requestMessage.Headers.Add(HttpHeaders.XmsClientRequestId, GetRequestMsClientId());

            return requestMessage;
        }

        private DataTable ConvertJsonToDataTable(string json, string url)
        {
            var dataTable = new DataTable();

            // First check if query cancelled
            if (json.Contains("Query cancelled by the user's request (E_QUERY_CANCELLED)"))
            {
                _logger.LogInformation("Query cancelled by the user's request");
                dataTable.Columns.Add("ErrorMessage", typeof(string));
                var dataRow = dataTable.NewRow();
                dataRow["ErrorMessage"] = "Query cancelled by the user's request (E_QUERY_CANCELLED)";
                dataTable.Rows.Add(dataRow);
                return dataTable;
            }

            // Handle a management query result
            if (url.Contains("mgmt"))
            {
                var jsonObject = JObject.Parse(json);
                if (jsonObject["Tables"] is JArray tables)
                {
                    foreach (var table in tables)
                    {
                        AddColumnsAndRows(dataTable, table["Columns"] as JArray, table["Rows"] as JArray);
                    }
                }
            }
            else
            {
                // Handle a query result
                var jsonArray = JArray.Parse(json);
                var primaryResult = jsonArray.FirstOrDefault(obj => obj["TableKind"]?.ToString() == "PrimaryResult");
                if (primaryResult != null)
                {
                    AddColumnsAndRows(dataTable, primaryResult["Columns"] as JArray, primaryResult["Rows"] as JArray);
                }
            }

            return dataTable;
        }

        private static void AddColumnsAndRows(DataTable dataTable, JArray columns, JArray rows)
        {
            if (columns == null || rows == null) return;

            // Create columns if they don't already exist
            foreach (var column in columns)
            {
                if (!dataTable.Columns.Contains(column["ColumnName"].ToString()))
                {
                    dataTable.Columns.Add(column["ColumnName"].ToString(), typeof(string));
                }
            }

            // Add rows
            foreach (var row in rows)
            {
                var dataRow = dataTable.NewRow();
                for (int i = 0; i < columns.Count; i++)
                {
                    dataRow[i] = row[i].ToString();
                }
                dataTable.Rows.Add(dataRow);
            }
        }

        private string GetRequestIdHeader()
        {
            if (_httpContextAccessor.HttpContext != null && _httpContextAccessor.HttpContext.Request.Headers.TryGetValue(HttpHeaders.RequestId, out var headerValue))
            {
                return headerValue;
            }

            return null;
        }

        private string GetRequestMsClientId()
        {
            if (_httpContextAccessor.HttpContext != null && _httpContextAccessor.HttpContext.Request.Headers.TryGetValue(HttpHeaders.XmsClientRequestId, out var headerValue))
            {
                return headerValue[0];
            }

            return null;
        }
    }
}