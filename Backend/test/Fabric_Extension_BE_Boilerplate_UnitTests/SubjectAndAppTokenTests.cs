using Boilerplate.Contracts;
using NUnit.Framework;
using System.Net;
using System.Security.Authentication;

namespace Boilerplate.Tests
{
    [TestFixture]
    public class SubjectAndAppTokenTests
    {
        [Test]
        public void Parse_ValidAuthorizationHeader_ReturnsSubjectAndAppToken()
        {
            // Subject and App token exists
            TestSubjectAndAppTokenParsing(
                "SubjectAndAppToken1.0 subjectToken=\"eyJSubjectToken\", appToken=\"eyJAppToken\"",
                "eyJSubjectToken",
                "eyJAppToken");

            // Subject token is empty. App token exists
            TestSubjectAndAppTokenParsing(
                "SubjectAndAppToken1.0 subjectToken=\"\", appToken=\"eyJAppToken\"",
                string.Empty,
                "eyJAppToken");

            /* Invalid tokens */
            TestSubjectAndAppTokenParsing(
                "InvalidAuthorizationHeader",
                string.Empty,
                string.Empty,
                shouldFail: true);

            TestSubjectAndAppTokenParsing(
                "SubjectAndAppToken1.0 subjectToken=\"invalidSubjectToken\", appToken=\"eyJAppToken\"",
                string.Empty,
                string.Empty,
                shouldFail: true);

            TestSubjectAndAppTokenParsing(
                "SubjectAndAppToken1.0 subjectToken=\"eyJSubjectToken\", appToken=\"invalidAppToken\"",
                string.Empty,
                string.Empty,
                shouldFail: true);
        }


        [Test]
        public void GenerateAuthorizationHeaderValue_ReturnsCorrectValue()
        {
            // Arrange
            string subjectToken = "eyJSubjectToken";
            string appToken = "eyJAppToken";

            // Act
            var result = SubjectAndAppToken.GenerateAuthorizationHeaderValue(subjectToken, appToken);

            // Assert
            Assert.That(result, Is.EqualTo($"SubjectAndAppToken1.0 subjectToken=\"{subjectToken}\", appToken=\"{appToken}\""));
        }

        private void TestSubjectAndAppTokenParsing(
            string authorizationHeader,
            string expectedSubjectToken,
            string expectedAppToken,
            bool shouldFail = false) 
        {
            if (shouldFail)
            {
                // Act & Assert
                var exception = Assert.Throws<AuthenticationException>(() => SubjectAndAppToken.Parse(authorizationHeader));
                Assert.That(exception.Message, Is.EqualTo("Invalid Authorization header"));
            }
            else
            {
                // Act
                var result = SubjectAndAppToken.Parse(authorizationHeader);

                // Assert
                Assert.That(result.SubjectToken, Is.EqualTo(expectedSubjectToken));
                Assert.That(result.AppToken, Is.EqualTo(expectedAppToken));
            }
        }
    }
}
