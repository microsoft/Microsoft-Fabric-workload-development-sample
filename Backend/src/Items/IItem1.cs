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
        Task<(int Operand1, int Operand2)> Double();

        /// <summary>
        /// Returns the last result of the calculation, as calculated by the last executed job.
        /// </summary>
        /// <returns>The latest calculation result</returns>
        Task<string> GetLastResult();
    }
}
