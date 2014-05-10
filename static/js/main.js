/*
 * Views' Initialization
 *
 * for adding a view please add the function and the function name into views_to_init
 */
BigData_Views = [
    init_data_view,
    init_map_view
]
BigData_Views_Update = {}
BigData_Managers = {};

MapData = {};


/*
 *
 #####
#     #  ####  #    # #    #  ####  #    #
#       #    # ##  ## ##  ## #    # ##   #
#       #    # # ## # # ## # #    # # #  #
#       #    # #    # #    # #    # #  # #
#     # #    # #    # #    # #    # #   ##
 #####   ####  #    # #    #  ####  #    #
 *
 *    Common view initiailzation
 */
function init_all_view () {

    // Obviously, they're for login/logout buttons.
    $("#btn-signin").click(function(e){
        e.preventDefault();
        sign_in();
    });
    $("#btn-signout").click(function(e){
        e.preventDefault();
        sign_out();
    });

    // logout the google user and back
    $("#btn-logout-google").click(function(){
        logout_google_user();
    });

    // switch between pages
    $(".btn-page").click(function(){
        var page_name = $(this).attr("page-target");
        // update acti
        $(".btn-page").parent('li').removeClass('active');
        $(this).parent('li').addClass('active');
        switch_page(page_name, false);
    });

    // this is the function to switch between login and logged in page.
    switch_page = function (page_name) {
        console.log(page_name);
        var in_options = {
            queue: true,
            duration: 500
        }

        var page_class_name = "." + page_name;
        //$(".page").fadeOut(out_options);
        $(".page").addClass("hide");
        $(page_class_name).fadeIn(in_options);
        $(page_class_name).removeClass("hide");

        if (page_name == "page-data") update_data_view();
    }

    // this is the function to switch between every functionalities in our website.
    // e.g Functions, Mappers, Reducers ... blah blah.
    switch_tab = function (tab_name) {
        var tab_class_name = ".tab-container-" + tab_name;
        console.log(tab_class_name);
        $("#tabbar li").removeClass('active');
        $("#tab-"+tab_name).parent('li').addClass('active');
        $(".tab-container").addClass('hide');
        $(tab_class_name).fadeIn({
            queue: true,
            duration: 500
        });
        $(tab_class_name).removeClass('hide');

        // Update page functions call here.
        var page_update_f = BigData_Views_Update[tab_name];
        if (page_update_f) {
            page_update_f();
        }
    }
}

/*
 * Query View initialization
 */
function init_data_view (){
    // initial CodeMirror code editor for placing users' query
    var codeEditor = document.getElementById("code-editor");
    sqlEditor = CodeMirror.fromTextArea(codeEditor, {
        mode: "text/x-sql",
        theme: "base16-light",
        lineWrapping: true,
        lineNumbers: true
    });

    // click on 'query' button will send out the query and get back the result
    $("#btn-query").click(function(e){

        // save for syncing textview and the editor
        sqlEditor.save();
        var query = $("#code-editor").val();
        var queryProjectId = $("#queryProjectId").val();

        // do query api
        BigQueryAPI_query(query, queryProjectId, function(data) {
            // transform the data from object to array
            var rows = data.rows.map(function(row) {return [ row.f[0].v, parseFloat(row.f[1].v) ]});

            // reset the MapData
            MapData = {};
        
            // init the value of MapData
            rows.map(function(r) {
                var name = r[0];
                var value = r[1];

                MapData[name] = 0;
            });

            // accumulate the value of MapData
            rows.map(function(r) {
                var name = r[0];
                var value = r[1];
            
                MapData[name] += value ;
            });

            // visualize the data
            update_map_view();
        });

    });
}
update_data_view = function () {
    /*
     * because at the first we need to hide everything,
     * here's a code mirror issue, you will need to refresh one times
     * in order to make the editor appear.
     */
    sqlEditor.refresh();
}
BigData_Views_Update['data'] = update_data_view;


function init_map_view () {
    /*
     * Initialize the Taiwan map
     */
    d3.json("static/data/twCounty2010.topo.json", function (data) {
        // load data with topojson.js
        console.log(data);
        topo = topojson.feature(data, data.objects["twCounty2010.geo"]);
        
        // prepare a Mercator projection for Taiwan
        prj = d3.geo.mercator().center([122.999531, 23.978567]).scale(30000);
        path = d3.geo.path().projection(prj);
        
        // render them on a svg element with id "map"
        blocks = d3.select("svg#d3target").selectAll("path").data(topo.features).enter()
        .append("path").attr("d",path);

        // fill bg color
        blocks.attr('fill', function(){return "#DFDFDF";});
    });

}

update_map_view = function () {
    /*
     * Update the map by the MapData
     */
    var minBound = 10000000;
    var maxBound = 0;

    // determine the boundary
    for (var k in MapData) {
        var v = MapData[k];
        if (v > maxBound) maxBound = v;
        if (v < minBound) minBound = v;
    }
    
    // hard code min, max bound for presenting effect
    minBound = 0;
    maxBound = 28;

    var colorPatterns = ["#DFDFDF","#00933B", "#0266C8", "#F2B50F", "#F90101"];
    var partition = ( maxBound - minBound )/ colorPatterns.length;
    var domainPartition = _.range(5).map(function(v){return minBound + v*partition;});


    // define color map
    var colorMap = d3.scale.linear()
        .domain(domainPartition)
        .range(colorPatterns);

    // update MapData
    for(i = 0; i < topo.features.length; i ++ ) {
        topo.features[i].properties.value = MapData[topo.features[i].properties.name]
    }

    // do filling
    blocks.attr("fill",function(it){
        var color = colorMap(it.properties.value);
        if ( color !== "#NaNNaNNaN" ) return color;
        return "#DFDFDF";
    });
}


/*
 * Main Entry Point
 */

init_all_view();

/*
   page initialization
   lock signin button until loaded the endpoints modules.
   switch to login page (this is a single page app.)
   */
$(function() {
    lock_signin_btn();
    switch_page('page-login');
});

/*
   CLIENT_ID: client id for web application, you should register one 
   in your cloud console.
   SCOPES: reference to OAuth2 scopes, just google that on Google Developer site.
   */
// ORIGINAL LOCAL TESTING
var CLIENT_ID = '948499484220-9bd022tr3fhj3qrv9m7b62ir66itjemu.apps.googleusercontent.com'
var SCOPES = [
'https://www.googleapis.com/auth/userinfo.email',
'https://www.googleapis.com/auth/bigquery',
'https://www.googleapis.com/auth/plus.login',
'https://www.googleapis.com/auth/plus.me',
'https://www.googleapis.com/auth/devstorage.read_only'
]

// Load profile information, callback will be called with one argument, which is the profile data with JSON format.
load_gplus_profile = function(callback) {
    var plus_options = {
        userId: 'me',
        field: 'image'
    };

    gapi.client.plus.people
        .get(plus_options)
        .execute(function(profile) {
            callback(profile);
        });
}
// Entry point for endpoints, everything starts from here.

function load_gapis() {
    var apiToLoad = 3; // this has to be the same number of libs which called gapi.cliend.load function.

    // here ensures all libs have been loaded well.
    var loadCallback = function() {
        if (--apiToLoad === 0) {
            console.log('loaded');
            unlock_signin_btn();

            signin_with_gapi(true, function() {
                load_gplus_profile(function(profile) {
                    if (profile.image) {
                        var profile_pic_url = profile.image.url;
                        profile_pic_url = profile_pic_url.replace(/sz=50/, "sz=250");
                        $("#profile_pic_img").attr('src', profile_pic_url);
                    }
                });
            });
            $(".loading_page").hide();
            BigQueryAPI = gapi.client.bigquery;
        }
    };
    gapi.client.load('oauth2', 'v2', loadCallback);
    gapi.client.load('plus', 'v1', loadCallback);
    gapi.client.load('bigquery', 'v2', loadCallback);
}

// login method, don't touch this, BLACK MAGIC.
var signin_with_gapi = function(immediate, callback) {
    gapi.auth.authorize({
        client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: immediate
    },
    callback);
}

var login_action = function() {

    load_gplus_profile(function(profile) {
        var profile_display_name = profile.displayName;
        $("#g_username").html(profile_display_name);

        $("#signin_status").removeClass('hide');
        $("#menu-bar").removeClass('hide');
        $("#signout_status").removeClass('hide');

        // initialize all views
        BigData_Views.map(function(init_f) {
            init_f()
        });
        switch_page('page-data');
    });
};

// this is the function to let you login, if you need login just call this one.

function sign_in() {
    signin_with_gapi(false, function() {
        login_action();
    });
}
// the same of above one, but this is for sign out.

function sign_out() {
    document.location.reload();
    gapi.auth.setToken(null);
    gapi.auth.signOut();
    $("#signin_status").addClass('hide');
    $("#btn-signout").addClass('hide');
    $("#signout_status").addClass('hide');

    switch_page('page-login');
}
