export default-bigquery-project-id = 'gcdc2013-coder'

bigquery-api-query = (query, query-project-id, callback) ->

  console.log project-id: default-bigquery-project-id, query: query

  query-options =
    * project-id: query-project-id or default-bigquery-project-id
      query: query

  bigquery-api.jobs.query query-options .execute callback


