prelude = require 'prelude-ls'

init-all-view = !->
  $ '#btn-signin' .click (e) !->
    e.prevent-default!
    sign-in!

  $ '#btn-signout' .click (e) !->
    e.prevent-default!
    sign-out!

/*
Data View Initialization
*/
init-data-view = !->
  code-editor = document.get-element-by-id \code-editor
  sql-editor = CodeMirror.fromTextArea code-editor, do
    mode: \text/x-sql
    theme: \base16-light
    line-wrapping: true
    line-numbers: true
    

  /*
  Here describes how to get various data from BigQuery API
  TODO: table autocompletion
  */
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
    


    

  $ \#btn-query .click (e) !->
    sql-editor.save!

    query = $ \#code-editor .val!
    query-project-id = $ \#query-project-id .val!

    bigquery-api-query query, query-project-id, (data) !->
      rows = data.rows.map (row) -> [ row.f[0].v, parse-float row.f[1].v ]

      export map-data = {}

      rows.map (r) !->
        name = r[0]
        value = r[1]

        map-data[name] = 0

      rows.map (r) !->
        name = r[0]
        value = r[1]

        map-data[name] += value

      update-map-view!
  export sql-editor

update-data-view = !->
  sql-editor.refresh!

/*
Map View Initialization
*/
init-map-view = !->

  d3.json "static/data/twCounty2010.topo.json" (data) !->
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

update-map-view = !->
  /*
    * Update the map by the map-data
    */

  # determine the boundary
  vals = [v for k, v of map-data]
  min-bound = _.min vals
  max-bound = _.max vals

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
    if color !== \#NaNNaNNaN
      color
    else
      \#DFDFDF

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
  api-to-load = 3

  load-callback = !->
    if --api-to-load is 0
      export bigquery-api = gapi.client.bigquery
      export google-plus-api = gapi.client.plus

      do
        <-! signin-with-gapi true
        do
          {image} <-! load-gplus-profile
          $ "\#profile_pic_img" .attr \src, image.url.replace /sz=50/, "sz=250" if image

      unlock-signin-btn!
      $ \.loading_page .hide!

  gapi.client.load \oauth2 \v2 load-callback
  gapi.client.load \plus \v1 load-callback
  gapi.client.load \bigquery \v2 load-callback

signin-with-gapi = (immediate, callback) !->
  gapi.auth.authorize do
    client_id: client-id
    scope: scopes
    immediate: immediate,
    callback

login-action = !->
  do
    {display-name} <- load-gplus-profile
    $ "\#g_username" .html display-name

    $ "\#signin_status" .removeClass 'hide'
    $ "\#menu-bar" .removeClass 'hide'
    $ "\#signout_status" .removeClass 'hide'

    # initialize all views
    bigdata-views.map (it) ->
      it!
    switch-page \page-data

sign-in = !->
  do
    <-! signin-with-gapi false
    login-action!

sign-out = !->
  document.location.reload!

bigdata-views = [ init-data-view, init-map-view ]
