default_bigquery_project_id = "gcdc2013-coder";

BigQueryAPI_query = function (query, callback) {
    var queryOptions = {
        projectId: default_bigquery_project_id,
        query: query
    };

    BigQueryAPI.jobs.query(queryOptions).execute(callback);
}


