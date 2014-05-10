App = Ember.Application.create({
  rootElement: '#app'
});

App.ApiData = [
{
    label: "GenericMapreduce",
    end: 1387463696446,
    parent: null,
    className: "done",
    start: 1387463626244
},
{
    label: "MapperPipeline",
    end: 1387463696084,
    parent: 0,
    className: "done",
    start: 1387463626462
},
{
    label: "shard-0",
    end: 1387463687000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-1",
    end: 1387463688000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-2",
    end: 1387463689000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-3",
    end: 1387463690000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-4",
    end: 1387463690000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-5",
    end: 1387463690000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-6",
    end: 1387463690000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-7",
    end: 1387463690000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-8",
    end: 1387463690000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-9",
    end: 1387463691000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-10",
    end: 1387463691000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-11",
    end: 1387463691000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-12",
    end: 1387463691000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-13",
    end: 1387463692000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-14",
    end: 1387463692000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "shard-15",
    end: 1387463692000,
    parent: 1,
    className: "success",
    start: 1387463626000
},
{
    label: "UpdateJob",
    end: 1387463696537,
    parent: 0,
    className: "done",
    start: 1387463695225
}
];

App.ChromeDevToolsTimetreeView = Ember.Timetree.TimetreeView.extend({
  timeTickFormat: Ember.computed(function() {
    var minTime = this.get('xScale').domain()[0];
    var minTime = d3.min(this.content.mapProperty('start'));
    return function(d){ return parseInt(d - minTime) + 'ms'; };
}).property(),

  durationFormatter: function(n) { return (n.end - n.start) + 'ms'; }
});
