var bigdataViews, mapData, clientId, scopes, loadGplusProfile, loadGapis, signinWithGapi, loginAction, signIn, signOut, out$ = typeof exports != 'undefined' && exports || this;
bigdataViews = [initDataView, initMapView];
mapData = {};
out$.initAllView = initAllView;
function initAllView(){
  $('#btn-signin').click(function(e){
    e.preventDefault();
    signIn();
  });
  $('#btn-signout').click(function(e){
    e.preventDefault();
    signOut();
  });
}
/*
Data View Initialization
*/
out$.initDataView = initDataView;
function initDataView(){
  var editorTextarea, sqlEditor;
  editorTextarea = document.getElementById('code-editor');
  out$.sqlEditor = sqlEditor = CodeMirror.fromTextArea(editorTextarea, {
    mode: 'text/x-sql',
    theme: 'base16-light',
    lineWrapping: true,
    lineNumbers: true
  });
  $('#btn-query').click(function(clickEvent){
    var query, queryProjectId;
    sqlEditor.save();
    query = $('#code-editor').val();
    queryProjectId = $('#query-project-id').val();
    bigqueryApiQuery(query, queryProjectId, function(data){
      var rows;
      rows = data.rows.map(function(row){
        return [row.f[0].v, parseFloat(row.f[1].v)];
      });
      mapData = {};
      rows.map(function(arg$){
        var name, value;
        name = arg$[0], value = arg$[1];
        mapData[name] = 0;
      });
      rows.map(function(arg$){
        var name, value;
        name = arg$[0], value = arg$[1];
        mapData[name] += value;
      });
      updateMapView();
    });
  });
  /*
  Here describes how to get various data from BigQuery API
  TODO: table autocompletion
  */
  /*
  do
    {projects} <- bigquery-api.projects.list!execute
    console.log projects.map (.id)
  
  do
    {datasets} <- bigquery-api.datasets.list do
      project-id: default-bigquery-project-id
    .execute
    console.log datasets.map (.id)
  
  do
    {tables} <- bigquery-api.tables.list do
      project-id: default-bigquery-project-id
      dataset-id: \samples
    .execute
    console.log tables.map (.id)
  */
}
out$.updateDataView = updateDataView;
function updateDataView(){
  sqlEditor.refresh();
}
/*
Map View Initialization
*/
out$.initMapView = initMapView;
function initMapView(){
  d3.json("static/data/twCounty2010.topo.json", function(data){
    var topo, prj, path, blocks;
    topo = topojson.feature(data, data.objects["twCounty2010.geo"]);
    prj = d3.geo.mercator().center([122.999531, 23.978567]).scale(35000);
    path = d3.geo.path().projection(prj);
    blocks = d3.select("svg#d3target").selectAll("path").data(topo.features).enter().append("path").attr("d", path);
    blocks.attr('fill', function(){
      return "#DFDFDF";
    });
    out$.blocks = blocks;
    out$.topo = topo;
  });
}
out$.updateMapView = updateMapView;
function updateMapView(){
  /*
    * Update the map by the map-data
    */
  var vals, res$, k, ref$, v, minBound, maxBound, colorPatterns, partition, domainPartition, colorMap;
  res$ = [];
  for (k in ref$ = mapData) {
    v = ref$[k];
    res$.push(v);
  }
  vals = res$;
  minBound = _.min(vals);
  maxBound = _.max(vals);
  colorPatterns = ['#DFDFDF', '#00933B', '#0266C8', '#F2B50F', '#F90101'];
  partition = (maxBound - minBound) / colorPatterns.length;
  domainPartition = _.range(5).map(function(v){
    return minBound + v * partition;
  });
  colorMap = d3.scale.linear().domain(domainPartition).range(colorPatterns);
  topo.features.map(function(feature){
    return feature.properties.value = mapData[feature.properties.name];
  });
  blocks.attr("fill", function(it){
    var color;
    color = colorMap(it.properties.value);
    if (!deepEq$(color, '#NaNNaNNaN', '===')) {
      return color;
    } else {
      return '#DFDFDF';
    }
  });
}
/*
main
*/
initAllView();
$(function(){
  lockSigninBtn();
  switchPage('page-login');
});
clientId = '948499484220-9bd022tr3fhj3qrv9m7b62ir66itjemu.apps.googleusercontent.com';
scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/bigquery', 'https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.me', 'https://www.googleapis.com/auth/devstorage.read_only'];
loadGplusProfile = function(callback){
  var plusOptions;
  plusOptions = {
    userId: 'me',
    field: 'image'
  };
  googlePlusApi.people.get(plusOptions).execute(function(profile){
    return callback(profile);
  });
};
loadGapis = function(){
  var apiToLoad;
  apiToLoad = 3;
  gapi.client.load('oauth2', 'v2', loadApiCallback);
  gapi.client.load('plus', 'v1', loadApiCallback);
  gapi.client.load('bigquery', 'v2', loadApiCallback);
  function loadApiCallback(){
    var bigqueryApi, googlePlusApi;
    if (--apiToLoad === 0) {
      out$.bigqueryApi = bigqueryApi = gapi.client.bigquery;
      out$.googlePlusApi = googlePlusApi = gapi.client.plus;
      unlockSigninBtn();
      $('.loading_page').hide();
      return signinWithGapi(true, function(){
        loadGplusProfile(function(arg$){
          var image;
          image = arg$.image;
          if (image) {
            $("#profile_pic_img").attr('src', image.url.replace(/sz=50/, "sz=250"));
          }
        });
      });
    }
  }
};
signinWithGapi = function(immediate, callback){
  gapi.auth.authorize({
    client_id: clientId,
    scope: scopes,
    immediate: immediate
  }, callback);
};
loginAction = function(){
  loadGplusProfile(function(arg$){
    var displayName;
    displayName = arg$.displayName;
    $("#g_username").html(displayName);
    $("#signin_status").removeClass('hide');
    $("#menu-bar").removeClass('hide');
    $("#signout_status").removeClass('hide');
    bigdataViews.map(function(it){
      return it();
    });
    return switchPage('page-data');
  });
};
signIn = function(){
  signinWithGapi(false, function(){
    loginAction();
  });
};
signOut = function(){
  document.location.reload();
};
function deepEq$(x, y, type){
  var toString = {}.toString, hasOwnProperty = {}.hasOwnProperty,
      has = function (obj, key) { return hasOwnProperty.call(obj, key); };
  var first = true;
  return eq(x, y, []);
  function eq(a, b, stack) {
    var className, length, size, result, alength, blength, r, key, ref, sizeB;
    if (a == null || b == null) { return a === b; }
    if (a.__placeholder__ || b.__placeholder__) { return true; }
    if (a === b) { return a !== 0 || 1 / a == 1 / b; }
    className = toString.call(a);
    if (toString.call(b) != className) { return false; }
    switch (className) {
      case '[object String]': return a == String(b);
      case '[object Number]':
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        return +a == +b;
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') { return false; }
    length = stack.length;
    while (length--) { if (stack[length] == a) { return true; } }
    stack.push(a);
    size = 0;
    result = true;
    if (className == '[object Array]') {
      alength = a.length;
      blength = b.length;
      if (first) { 
        switch (type) {
        case '===': result = alength === blength; break;
        case '<==': result = alength <= blength; break;
        case '<<=': result = alength < blength; break;
        }
        size = alength;
        first = false;
      } else {
        result = alength === blength;
        size = alength;
      }
      if (result) {
        while (size--) {
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))){ break; }
        }
      }
    } else {
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) {
        return false;
      }
      for (key in a) {
        if (has(a, key)) {
          size++;
          if (!(result = has(b, key) && eq(a[key], b[key], stack))) { break; }
        }
      }
      if (result) {
        sizeB = 0;
        for (key in b) {
          if (has(b, key)) { ++sizeB; }
        }
        if (first) {
          if (type === '<<=') {
            result = size < sizeB;
          } else if (type === '<==') {
            result = size <= sizeB
          } else {
            result = size === sizeB;
          }
        } else {
          first = false;
          result = size === sizeB;
        }
      }
    }
    stack.pop();
    return result;
  }
}