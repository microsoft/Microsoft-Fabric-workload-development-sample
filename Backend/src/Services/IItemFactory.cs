// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using Boilerplate.Items;

namespace Boilerplate.Services
{
    public interface IItemFactory
    {
        IItem CreateItem(string itemType, AuthorizationContext authorizationContext);
    }
}
