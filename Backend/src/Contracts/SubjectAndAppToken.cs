// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Text.RegularExpressions;
using System;
using System.Security.Authentication;

namespace Boilerplate.Contracts
{
    public class SubjectAndAppToken
    {
        private const string HeaderPattern = @"^SubjectAndAppToken1\.0 subjectToken=""(eyJ[\w\-\._]+)"", appToken=""(eyJ[\w\-\._]+)""$";

        private const string HeaderPatternWithEmptySubjectToken = @"^SubjectAndAppToken1\.0 subjectToken="""", appToken=""(eyJ[\w\-\._]+)""$";

        public string SubjectToken { get; init; }

        public string AppToken { get; init; }

        /// <summary>
        /// Parses the value of the Authorization header with SubjectAndAppToken1.0 scheme and extracts subject and app AAD tokens
        /// </summary>
        /// <param name="authorizationHeaderValue">The value of the Authorization header</param>
        /// <returns>An object which contains subject and app AAD tokens</returns>
        /// <exception cref="AuthenticationException">Thrown when the provided Authorization header values does not match the expected format</exception>
        public static SubjectAndAppToken Parse(string authorizationHeaderValue)
        {
            var match = Regex.Match(authorizationHeaderValue, HeaderPattern, RegexOptions.None, TimeSpan.FromMilliseconds(100));

            if (!match.Success)
            {
                return ParseWithEmptySubjectToken(authorizationHeaderValue);
            }

            return new SubjectAndAppToken { SubjectToken = match.Groups[1].Value, AppToken = match.Groups[2].Value };
        }

        /// <summary>
        /// Creates the value for the Authorization header with SubjectAndAppToken1.0 scheme
        /// </summary>
        /// <param name="subjectToken">Subject's delegated token.</param>
        /// <param name="appToken">App token.</param>
        /// <returns>The value for the Authorization header with SubjectAndAppToken1.0 scheme.</returns>
        public static string GenerateAuthorizationHeaderValue(string subjectToken, string appToken)
        {
            return $"SubjectAndAppToken1.0 subjectToken=\"{subjectToken}\", appToken=\"{appToken}\"";
        }

        private static SubjectAndAppToken ParseWithEmptySubjectToken(string authorizationHeaderValue)
        {
            var match = Regex.Match(authorizationHeaderValue, HeaderPatternWithEmptySubjectToken, RegexOptions.None, TimeSpan.FromMilliseconds(100));

            if (!match.Success)
            {
                throw new AuthenticationException("Invalid Authorization header");
            }

            return new SubjectAndAppToken { SubjectToken = string.Empty, AppToken = match.Groups[1].Value };
        }
    }
}
