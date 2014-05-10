init-all-view = !->
  $ '#btn-signin' .click (e) !->
    e.prevent-default!
    sign_in!

  $ '#btn-signout' .click (e) !->
    e.prevent-default!
    sign_out!

  switch_page = (page-name) !->
    in-options =
      queue: true,
      duration: 500

    page-class-name = ".#page_name"
    $ \.page .addClass \.hide
    $ page-class-name
      .fade-in in-options
      .remove-class \hide

    if page-name is \page-data
      update-data-view!


init-data-view = !->
  code-editor = document.get-element-by-id \code-mirror
  sql-editor = CodeMirror.fromTextArea code-editor, do
    mode: \text/x-sql
    theme: \base16-light
    line-wrapping: true
    line-numbers: true

  $ \#btn-query .click (e) !->
    sql-editor.save!

    query = $ \#code-editor .val!
    query-project=id = $ \#query-project-id .val!

    bigquery-api-query query, query-project-id, (data) ->
      rows = data.rows.map (row) -> [ row.f[0].v, parse-float row.f[1].v ]

      MapData = {}

      rows.map (r) !->
        name = r[0]
        value = r[1]

        MapData[name] = 0

      rows.map (r) !->
        name = r[0]
        value = r[1]

        MapData[name] += value

      update-map-view!

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
    blocks = d3.select "svg#d3target"
      .selectAll "path"
      .data topo.features
      .enter!
      .append "path"
      .attr "d", path

    # fill bg color
    blocks.attr 'fill', -> "\#DFDFDF"

update-map-view = !->
    /*
     * Update the map by the MapData
     */

    # determine the boundary
    vals = [v for k, v of MapData] 
    min-bound = min vals
    max-bound = max vals
    
    # hard code min, max bound for presenting effect
    minBound = 0;
    maxBound = 28;

    color-patterns = <[#DFDFDF #00933B #0266C8 #F2B50F #F90101]>
    partition = ( maxBound - minBound ) / colorPatterns.length
    domain-parition = _.range 5 .map (v) -> min-bound + v * partition

    # define color map
    color-map = d3.scale.linear!
      .domain domain-partition
      .range color-patterns

    # update MapData
    topo.features.map (feature) ->
      feature.properties.value = MapData[feature.properties.name]

    # do filling
    blocks.attr "fill", (it) ->
        color = colorMap it.properties.value
        if  color !== "#NaNNaNNaN"
          color
        else
          "\#DFDFDF"


init-all-view!

$ () !->
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

load_gapis = !->
  api-to-load = 3

  load-callback = !->
    if --api-to-load is 0
      console.log \loaded
      unlock-signin-btn!

      signin-with-gapi true, !->
        load-gplus-profile (profile) !->
          if profile.image
            profile-pic-url = profile.image.url
              .replace /sz=50/, "sz=250
            $ "\#profile_pic_image"
              .attr \src, profile-pic-url
      $ \.loading_page .hide!
      big-query-api = gapi.client.bigquery
      google-plus-api = gapi.client.plus
            
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
    
sign-in = !->
  signin-with-gapi false, !->
    login-action!

sign-out = !->
  document.location.reload!
