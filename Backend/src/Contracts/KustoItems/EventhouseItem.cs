using System;

namespace Boilerplate.Contracts.KustoItems;

public class EventhouseItem
{
    public Guid WorkspaceId { get; init; }

    public Guid Id { get; init; }

    public string Type { get; init; }

    public string DisplayName { get; init; }

    public string Description { get; init; }

    public EventhouseProperties Properties { get; init; }
}

public class EventhouseProperties
{
    public string QueryServiceUri { get; init; }
    public string IngestionServiceUri { get; init; }
    public Guid[] DatabasesItemIds { get; init; }
}