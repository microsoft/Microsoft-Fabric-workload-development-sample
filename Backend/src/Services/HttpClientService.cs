// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    /// <summary>
    /// Service for making HTTP requests using HttpClient with optional authentication.
    /// </summary>
    public class HttpClientService : IHttpClientService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<HttpClientService> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="HttpClientService"/> class.
        /// </summary>
        /// <param name="logger">The logger for capturing log messages.</param>
        public HttpClientService(ILogger<HttpClientService> logger)
        {
            // Initialize an HttpClient for making HTTP requests.
            _httpClient = new HttpClient();
            _logger = logger;
        }

        /// <summary>
        /// Determines if the provided access token represents a SubjectAndAppToken.
        /// </summary>
        /// <param name="accessToken">The access token to check.</param>
        /// <returns>True if the access token represents a SubjectAndAppToken, otherwise false.</returns>
        private bool IsSubjectAndAppToken(string accessToken)
        {
            // Implement the logic to determine if it's a SubjectAndAppToken here
            // For example, check if it starts with "SubjectAndAppToken"
            return accessToken.StartsWith("SubjectAndAppToken");
        }

        /// <summary>
        /// Creates an HttpRequestMessage with the provided method, requestUri, and accessToken.
        /// </summary>
        /// <param name="method">The HTTP method for the request.</param>
        /// <param name="requestUri">The request URI.</param>
        /// <param name="accessToken">The access token for authentication.</param>
        /// <returns>An HttpRequestMessage instance.</returns>
        private HttpRequestMessage CreateRequest(HttpMethod method, string requestUri, string accessToken)
        {
            var request = new HttpRequestMessage(method, requestUri);

            if (!string.IsNullOrEmpty(accessToken))
            {
                if (IsSubjectAndAppToken(accessToken))
                {
                    request.Headers.Add("Authorization", accessToken);
                }
                else
                {
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                }
            }

            return request;
        }

        /// <summary>
        /// Sends an HTTP request and returns the response.
        /// </summary>
        /// <param name="request">The HttpRequestMessage to send.</param>
        /// <returns>An HttpResponseMessage containing the HTTP response.</returns>
        private async Task<HttpResponseMessage> SendRequest(HttpRequestMessage request)
        {
            _logger.LogInformation($"Sending {request.Method} request to {request.RequestUri}.");
            return await _httpClient.SendAsync(request);
        }

        /// <summary>
        /// Sends an HTTP GET request asynchronously.
        /// </summary>
        /// <param name="requestUri">The request URI.</param>
        /// <param name="accessToken">The access token for authentication.</param>
        /// <returns>An HttpResponseMessage containing the HTTP response.</returns>
        public async Task<HttpResponseMessage> GetAsync(string requestUri, string accessToken)
        {
            var request = CreateRequest(HttpMethod.Get, requestUri, accessToken);
            return await SendRequest(request);
        }

        /// <summary>
        /// Sends an HTTP PUT request asynchronously.
        /// </summary>
        /// <param name="requestUri">The request URI.</param>
        /// <param name="content">The HTTP content to send with the request.</param>
        /// <param name="accessToken">The access token for authentication.</param>
        /// <returns>An HttpResponseMessage containing the HTTP response.</returns>
        public async Task<HttpResponseMessage> PutAsync(string requestUri, HttpContent content, string accessToken)
        {
            var request = CreateRequest(HttpMethod.Put, requestUri, accessToken);
            request.Content = content;
            return await SendRequest(request);
        }

        /// <summary>
        /// Sends an HTTP POST request asynchronously.
        /// </summary>
        /// <param name="requestUri">The request URI.</param>
        /// <param name="content">The HTTP content to send with the request.</param>
        /// <param name="accessToken">The access token for authentication.</param>
        /// <returns>An HttpResponseMessage containing the HTTP response.</returns>
        public async Task<HttpResponseMessage> PostAsync(string requestUri, HttpContent content, string accessToken)
        {
            var request = CreateRequest(HttpMethod.Post, requestUri, accessToken);
            request.Content = content;
            return await SendRequest(request);
        }

        /// <summary>
        /// Sends an HTTP PATCH request asynchronously.
        /// </summary>
        /// <param name="requestUri">The request URI.</param>
        /// <param name="content">The HTTP content to send with the request.</param>
        /// <param name="accessToken">The access token for authentication.</param>
        /// <returns>An HttpResponseMessage containing the HTTP response.</returns>
        public async Task<HttpResponseMessage> PatchAsync(string requestUri, HttpContent content, string accessToken)
        {
            var request = CreateRequest(new HttpMethod("PATCH"), requestUri, accessToken);
            request.Content = content;
            return await SendRequest(request);
        }

        /// <summary>
        /// Sends an HTTP DELETE request asynchronously.
        /// </summary>
        /// <param name="requestUri">The request URI.</param>
        /// <param name="accessToken">The access token for authentication.</param>
        /// <returns>An HttpResponseMessage containing the HTTP response.</returns>
        public async Task<HttpResponseMessage> DeleteAsync(string requestUri, string accessToken)
        {
            var request = CreateRequest(HttpMethod.Delete, requestUri, accessToken);
            return await SendRequest(request);
        }

        /// <summary>
        /// Sends an HTTP HEAD request asynchronously.
        /// </summary>
        /// <param name="requestUri">The request URI.</param>
        /// <param name="accessToken">The access token for authentication.</param>
        /// <returns>An HttpResponseMessage containing the HTTP response.</returns>
        public async Task<HttpResponseMessage> HeadAsync(string requestUri, string accessToken)
        {
            var request = CreateRequest(HttpMethod.Head, requestUri, accessToken);
            return await SendRequest(request);
        }

        /// <summary>
        /// Sends an HTTP POST request asynchronously with JSON content.
        /// </summary>
        /// <param name="requestUri">The request URI.</param>
        /// <param name="content">The JSON content to send with the request.</param>
        /// <param name="accessToken">The access token for authentication.</param>
        /// <returns>An HttpResponseMessage containing the HTTP response.</returns>
        public async Task<HttpResponseMessage> PostAsJsonAsync(string requestUri, HttpContent content, string accessToken)
        {
            _logger.LogInformation($"Sending POST request to {requestUri}.");

            if (!string.IsNullOrEmpty(accessToken))
            {
                if (IsSubjectAndAppToken(accessToken))
                {
                    _httpClient.DefaultRequestHeaders.Add("Authorization", accessToken);
                }
                else
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                }
            }

            return await _httpClient.PostAsJsonAsync(requestUri, content);
        }
    }
}
