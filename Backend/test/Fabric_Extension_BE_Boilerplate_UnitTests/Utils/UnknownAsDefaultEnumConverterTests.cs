// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using Fabric_Extension_BE_Boilerplate.Utils;
using NUnit.Framework;
using System.Text.Json;

namespace Boilerplate.Tests
{

    [TestFixture]
    public class UnknownAsDefaultEnumConverterTests
    {
        private JsonSerializerOptions _options;

        [SetUp]
        public void Setup()
        {
            _options = new JsonSerializerOptions
            {
                Converters = { new UnknownAsDefaultEnumConverter<Item1Operator>() }
            };
        }

        [TestCase(Item1Operator.Add, "Add")]
        [TestCase(Item1Operator.Subtract, "Subtract")]
        [TestCase(Item1Operator.Multiply, "Multiply")]
        [TestCase(Item1Operator.Divide, "Divide")]
        [TestCase(Item1Operator.Random, "Random")]
        [TestCase(Item1Operator.Undefined, "Undefined")]
        [TestCase(0, "Undefined")]
        [TestCase("0", "Undefined")]
        public void SerializeItem1Operator_Success(Item1Operator operatorValue, string expectedJson)
        {
            var json = JsonSerializer.Serialize(operatorValue, _options);
            Assert.That(json, Is.EqualTo($"\"{expectedJson}\""));
        }

        [TestCase("Add", Item1Operator.Add)]
        [TestCase("Subtract", Item1Operator.Subtract)]
        [TestCase("Multiply", Item1Operator.Multiply)]
        [TestCase("Divide", Item1Operator.Divide)]
        [TestCase("Random", Item1Operator.Random)]
        [TestCase("0", Item1Operator.Undefined)]
        [TestCase("'0'", Item1Operator.Undefined)]
        [TestCase("Undefined", Item1Operator.Undefined)]
        public void DeserializeItem1Operator_Success(string json, Item1Operator expectedOperator)
        {
            var operatorValue = JsonSerializer.Deserialize<Item1Operator>($"\"{json}\"", _options);
            Assert.That(operatorValue, Is.EqualTo(expectedOperator));
        }
    }
}