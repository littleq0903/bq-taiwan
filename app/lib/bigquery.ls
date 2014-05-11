default-bigquery-project-id = 'gcdc2013-coder'

bigquery-api-query = (query, query-project-id, callback) ->

  console.log default-bigquery-project-id

  query-options =
    * project-id: query-project-id or default-bigquery-project-id
      query: query

  bigquery-api.jobs.query query-options .execute callback


