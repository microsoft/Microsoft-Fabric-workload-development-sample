namespace Boilerplate.Contracts;

public class QueryKqlDatabaseRequest
{
    public string QueryServiceUri { set; get; }
    
    public string DatabaseName { set; get; }
    
    public string Query { set; get; }
}