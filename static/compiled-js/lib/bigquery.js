var defaultBigqueryProjectId, bigqueryApiQuery;
defaultBigqueryProjectId = 'gcdc2013-coder';
bigqueryApiQuery = function(query, queryProjectId, callback){
  var queryOptions;
  console.log(defaultBigqueryProjectId);
  queryOptions = {
    projectId: queryProjectId || defaultBigqueryProjectId,
    query: query
  };
  return bigqueryApi.jobs.query(queryOptions).execute(callback);
};