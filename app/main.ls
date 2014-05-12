bigdata-views = [ init-data-view, init-map-view ]
map-data = {}

export !function init-all-view
  $ '#btn-signin' .click (e) !->
    e.prevent-default!
    sign-in!

  $ '#btn-signout' .click (e) !->
    e.prevent-default!
    sign-out!

/*
Data View Initialization
*/
export !function init-data-view
  editor-textarea = document.get-element-by-id \code-editor
  export sql-editor = CodeMirror.fromTextArea editor-textarea, do
    mode: \text/x-sql
    theme: \base16-light
    line-wrapping: true
    line-numbers: true


  do
    click-event <-! $ \#btn-query .click
    # sync editor with textarea
    sql-editor.save!

    # retrieve data from fields
    query = $ \#code-editor .val!
    query-project-id = $ \#query-project-id .val!

    # go bigquery query
    do
      data <-! bigquery-api-query query, query-project-id

      # transform the data
      rows = data.rows.map (row) -> [ row.f[0].v, parse-float row.f[1].v ]

      # accumalate the data
      map-data := {}
      rows.map ([name, value]) !-> map-data[name] = 0
      rows.map ([name, value]) !-> map-data[name] += value

      # render the visualized data on the map
      update-map-view!

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

export !function update-data-view
  sql-editor.refresh!

/*
Map View Initialization
*/
export !function init-map-view
  # initialize the taiwan map
  do
    data <-! d3.json "static/data/twCounty2010.topo.json"

    # load data with topojson.js
    topo = topojson.feature data, data.objects["twCounty2010.geo"]

    # prepare a Mercator projection for Taiwan
    prj = d3.geo.mercator!
      .center [ 122.999531, 23.978567 ]
      .scale 35000
    path = d3.geo.path!
      .projection prj

    # render them on a svg element with id "map"
    blocks = d3.select "svg\#d3target" .selectAll "path"
      .data topo.features
      .enter!
      .append "path"
      .attr "d", path

    # fill bg color
    blocks.attr 'fill', -> "\#DFDFDF"

    export blocks, topo

export !function update-map-view
  /*
    * Update the map by the map-data
    */

  # determine the boundary
  vals = [v for k, v of map-data]
  min-bound = _.min vals
  max-bound = _.max vals

  # calculate size of partition
  color-patterns = <[#DFDFDF #00933B #0266C8 #F2B50F #F90101]>
  partition = ( max-bound - min-bound ) / colorPatterns.length
  domain-partition = _.range 5 .map (v) -> min-bound + v * partition

  # define color map
  color-map = d3.scale.linear!
    .domain domain-partition
    .range color-patterns

  # update map-data
  topo.features.map (feature) ->
    feature.properties.value = map-data[feature.properties.name]

  # do filling
  blocks.attr "fill", (it) ->
    color = colorMap it.properties.value
    if color !== \#NaNNaNNaN then color else \#DFDFDF

/*
main
*/
init-all-view!


$ !->
  lock-signin-btn!
  switch-page \page-login

client-id = '948499484220-9bd022tr3fhj3qrv9m7b62ir66itjemu.apps.googleusercontent.com'
scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/bigquery',
  'https://www.googleapis.com/auth/plus.login',
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/devstorage.read_only'
]

load-gplus-profile = (callback) !->
  plus-options =
    * user-id: \me
      field: \image

  do
    profile <- google-plus-api.people.get plus-options .execute
    callback profile

load-gapis = !->
  # totally 3 api to load
  api-to-load = 3
  gapi.client.load \oauth2 \v2 load-api-callback
  gapi.client.load \plus \v1 load-api-callback
  gapi.client.load \bigquery \v2 load-api-callback

  function load-api-callback
    if --api-to-load is 0
      # export apis for every component
      export bigquery-api = gapi.client.bigquery
      export google-plus-api = gapi.client.plus

      # unlock the homepage
      unlock-signin-btn!
      $ \.loading_page .hide!

      # show the gplus profile picture
      do
        <-! signin-with-gapi true
        {image} <-! load-gplus-profile
        $ "\#profile_pic_img" .attr \src, (image.url.replace /sz=50/, "sz=250") if image

signin-with-gapi = (immediate, callback) !->
  gapi.auth.authorize do
    client_id: client-id
    scope: scopes
    immediate: immediate,
    callback

login-action = !->
  {display-name} <- load-gplus-profile
  $ "\#g_username" .html display-name
  $ "\#signin_status" .removeClass 'hide'
  $ "\#menu-bar" .removeClass 'hide'
  $ "\#signout_status" .removeClass 'hide'

  # initialize all views
  bigdata-views.map ->
    it!
  switch-page \page-data

sign-in = !->
  <-! signin-with-gapi false
  login-action!

sign-out = !->
  document.location.reload!
