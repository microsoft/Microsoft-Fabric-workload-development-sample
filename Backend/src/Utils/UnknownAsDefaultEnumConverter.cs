// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Fabric_Extension_BE_Boilerplate.Utils
{
    public class UnknownAsDefaultEnumConverter<TEnum> : JsonConverter<TEnum> where TEnum : struct, Enum
    {
        public override TEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.String)
            {
                var stringValue = reader.GetString();
                bool ignoreCase = true;
                if (Enum.TryParse<TEnum>(stringValue, ignoreCase, out var parsedEnumValue))
                {
                    return parsedEnumValue;
                }
            }
            else if (reader.TokenType == JsonTokenType.Number)
            {
                if (reader.TryGetInt32(out int intValue) && Enum.IsDefined(typeof(TEnum), intValue))
                {
                    return (TEnum)Enum.ToObject(typeof(TEnum), intValue);
                }
            }
            // If the value is not a defined enum value, return the default value (0)
            return default(TEnum); // This will be the default value of the enum type
        }

        public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString());
        }
    }
}