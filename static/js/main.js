
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

    // switch between functionalities
    $("#tabbar li a").click(function(e){
        e.preventDefault();
        tab_name = $(this).attr('id').split('-')[1];
        console.log(tab_name);
        switch_tab(tab_name);
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
######     #    #######    #
#     #   # #      #      # #
#     #  #   #     #     #   #
#     # #     #    #    #     #
#     # #######    #    #######
#     # #     #    #    #     #
######  #     #    #    #     #
 *
 * Data View initialization
 */
function init_data_view (){
    var codeEditor = document.getElementById("code-editor");
    sqlEditor = CodeMirror.fromTextArea(codeEditor, {
        mode: "text/x-sql",
        theme: "base16-light",
        lineWrapping: true,
        lineNumbers: true
    });

    $("#btn-query").click(function(e){
        sqlEditor.save();
        var query = $("#code-editor").val();
        console.log(query);

        BigQueryAPI_query(query, function(data) {
            console.log(data);
            var result = data.rows;
            var rows = result.map(function(row) {return [ row.f[0].v, parseFloat(row.f[1].v) ]});

            // reset the MapData
            MapData = {};
        
            rows.map(function(r) {
                var name = r[0];
                var value = r[1];

                MapData[name] = 0;
            });

            rows.map(function(r) {
                var name = r[0];
                var value = r[1];
            
                MapData[name] += value ;
            });

            update_map_view();
        });

    });
}

update_data_view = function () {
    sqlEditor.refresh();
}
BigData_Views_Update['data'] = update_data_view;


function init_map_view () {
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

    var partition = ( maxBound - minBound )/ colorPatterns.length;
    var colorPatterns = ["#DFDFDF","#00933B", "#0266C8", "#F2B50F", "#F90101"];
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
