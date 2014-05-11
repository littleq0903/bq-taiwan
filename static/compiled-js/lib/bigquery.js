var defaultBigqueryProjectId, bigqueryApiQuery, out$ = typeof exports != 'undefined' && exports || this;
out$.defaultBigqueryProjectId = defaultBigqueryProjectId = 'gcdc2013-coder';
bigqueryApiQuery = function(query, queryProjectId, callback){
  var queryOptions;
  console.log(defaultBigqueryProjectId);
  queryOptions = {
    projectId: queryProjectId || defaultBigqueryProjectId,
    query: query
  };
  return bigqueryApi.jobs.query(queryOptions).execute(callback);
};