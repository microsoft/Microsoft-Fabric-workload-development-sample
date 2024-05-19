// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Boilerplate.Contracts
{
    public enum Item1Operator
    {
        Undefined = 0,
        Add = 1,
        Subtract = 2,
        Multiply = 3,
        Divide = 4,
        Random = 5,
    }

    public abstract class Item1MetadataBase<TLakehouse>
    {
        public int Operand1 { get; set; }
        public int Operand2 { get; set; }
        public Item1Operator Operator { get; set; }
        public TLakehouse Lakehouse { get; set; }
    }

    /// <summary>
    /// Represents the core metadata for item1 stored within the system's storage.
    /// </summary>
    public class Item1Metadata: Item1MetadataBase<ItemReference>
    {
        public static readonly Item1Metadata Default = new Item1Metadata { Lakehouse = new ItemReference() };

        public Item1Metadata Clone()
        {
            return new Item1Metadata
            {
                Lakehouse = Lakehouse,
                Operand1 = Operand1,
                Operand2 = Operand2,
                Operator = Operator,
            };
        }

        public Item1ClientMetadata ToClientMetadata(FabricItem lakehouse)
        {
            return new Item1ClientMetadata()
            {
                Operand1 = Operand1,
                Operand2 = Operand2,
                Operator = Operator,
                Lakehouse = lakehouse
            };
        }
    }

    /// <summary>
    /// Represents extended metadata for item1, including additional information
    /// about the associated lakehouse, tailored for client-side usage.
    /// </summary>
    public class Item1ClientMetadata : Item1MetadataBase<FabricItem> { }
}
