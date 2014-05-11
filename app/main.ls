prelude = require 'prelude-ls'

init-all-view = !->
  $ '#btn-signin' .click (e) !->
    e.prevent-default!
    sign-in!

  $ '#btn-signout' .click (e) !->
    e.prevent-default!
    sign-out!

init-data-view = !->
  code-editor = document.get-element-by-id \code-editor
  sql-editor = CodeMirror.fromTextArea code-editor, do
    mode: \text/x-sql
    theme: \base16-light
    line-wrapping: true
    line-numbers: true

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

init-map-view = !->

  d3.json "static/data/twCounty2010.topo.json" (data) !->
    # load data with topojson.js
    topo = topojson.feature data, data.objects["twCounty2010.geo"]

    # prepare a Mercator projection for Taiwan
    prj = d3.geo.mercator!
      .center [ 122.999531, 23.978567 ]
      .scale 30000
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
  partition = ( maxBound - minBound ) / colorPatterns.length
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


init-all-view!

switch-page = (page-name) !->
  in-options =
    queue: true,
    duration: 500

  page-class-name = ".#page-name"

  console.log page-class-name

  $ \.page .addClass \hide
  $ page-class-name
    .fade-in in-options
    .remove-class \hide

  if page-name is \page-data
    update-data-view!

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

  google-plus-api.people
    .get plus-options
    .execute (profile) !->
      callback profile

load-gapis = !->
  api-to-load = 3

  load-callback = !->
    if --api-to-load is 0
      export bigquery-api = gapi.client.bigquery
      export google-plus-api = gapi.client.plus

      unlock-signin-btn!

      signin-with-gapi true, !->
        load-gplus-profile (profile) !->
          if profile.image
            profile-pic-url = profile.image.url
              .replace /sz=50/, "sz=250"

            $ "\#profile_pic_img"
              .attr \src, profile-pic-url
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
  load-gplus-profile (profile) ->
    profile-display-name = profile.display-name
    $ "\#g_username" .html profile-display-name


    $ "\#signin_status" .removeClass 'hide'
    $ "\#menu-bar" .removeClass 'hide'
    $ "\#signout_status" .removeClass 'hide'

    # initialize all views
    bigdata-views.map (init_f) !->
      init_f!
    switch-page \page-data

sign-in = !->
  signin-with-gapi false, !->
    login-action!

sign-out = !->
  document.location.reload!

bigdata-views = [ init-data-view, init-map-view ]
