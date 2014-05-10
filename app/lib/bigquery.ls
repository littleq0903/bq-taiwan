defualt-bq-project-id = 'gcdc2013-coder'

bigquery-api-query = (query, query-project-id, callback) ->
  query-options =
    * project-id: query-project-id or default_bigquery_project_id
      query: query

  BigQueryAPI.jobs.query query-options .execute callback


