// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using System.Threading.Tasks;

namespace Boilerplate.Items
{
    public interface IItem1 : IItem
    {
        ItemReference Lakehouse { get; }

        int Operand1 { get; }

        int Operand2 { get; }

        Item1Operator Operator { get; }

        /// <summary>
        /// Doubles the operands produced by the item calculation.
        /// </summary>
        /// <returns>A task representing the asynchronous operation. The result is a tuple containing the doubled Operand1 and Operand2.</returns>
        Task<(double Operand1, double Operand2)> Double();
    }
}
