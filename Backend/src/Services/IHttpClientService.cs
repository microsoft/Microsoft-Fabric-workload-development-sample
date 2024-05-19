// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Net.Http;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    public interface IHttpClientService
    {
        Task<HttpResponseMessage> HeadAsync(string requestUri, string accessToken);

        Task<HttpResponseMessage> GetAsync(string requestUri, string accessToken);

        Task<HttpResponseMessage> PutAsync(string requestUri, HttpContent content, string accessToken);

        Task<HttpResponseMessage> PostAsync(string requestUri, HttpContent content, string accessToken);

        Task<HttpResponseMessage> PostAsJsonAsync(string requestUri, HttpContent content, string accessToken);

        Task<HttpResponseMessage> PatchAsync(string requestUri, HttpContent content, string accessToken);

        Task<HttpResponseMessage> DeleteAsync(string requestUri, string accessToken);
    }
}
