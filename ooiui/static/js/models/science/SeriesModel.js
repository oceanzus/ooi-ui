"use strict";
/*
 * ooiui/static/js/models/science/SeriesModel.js
 * Model definition for a series that fits into the Highcharts time series charts
 * Dependencies
 *  - d3
 */
/*
 used to manage data in high charts
 */
var SeriesModel = Backbone.Model.extend({
  urlRoot: '#',
  formatter: d3.format(".2f"),
  defaults: {
    //type: "scatter",
    name: "",
    //axisName: "test",
    //xaxisName: "test",
    //showInLegend: true,
    //enableMouseTracking: true,
    //color: "",
    data: [],
    //enableMarker: true,
    units:"",
    //xmin:0,
    //xmax:0,
    title:""
  }
});

var SeriesCollection = Backbone.Collection.extend({
  url: '#',
  model: SeriesModel
});

/*
 Data structures that come from uframe
 */
var DataSeriesModel = Backbone.Model.extend({
  urlRoot: '#',
  initialize: function(){
  }
});

var DataSeriesCollection = Backbone.Collection.extend({
  stream:"",
  displayName:"",
  ref_des:"",
  startdate:"",
  enddate:"",
  xparameters:[],
  yparameters:[],
  stream_display_name:"",
  initialize: function(models,options) {
    if (options && options.stream){
      this.stream = options.stream;
    }
    if (options && options.ref_des){
      this.ref_des = options.ref_des;
    }
    if (options && options.startdate){
      this.startdate = options.startdate;
    }
    if (options && options.displayName){
      this.displayName = options.displayName;
    }
    if (options && options.enddate){
      this.enddate = options.enddate;
    }
    if (options && options.xparameters){
      this.xparameters = options.xparameters;
    }
    if (options && options.yparameters){
      this.yparameters = options.yparameters;
    }
    if (options && options.stream_display_name){
      this.stream_display_name = options.stream_display_name;
    }

  },
  url: function() {
    var durl = '/api/get_data?instrument='+ this.ref_des+"&stream="+this.stream+"&xvars="+this.xparameters.join()+"&yvars="+this.yparameters.join()+"&startdate="+this.startdate+"&enddate="+this.enddate
    //console.log(durl);
    return durl;
  },
  //eg url: '/api/get_data?instrument=CE05MOAS-GL382-05-CTDGVM000&stream=telemetered_ctdgv_m_glider_instrument&xvars=time,time&yvars=sci_water_pressure,sci_water_cond&startdate=2015-01-21T22:01:48.103Z&enddate=2015-01-22T22:01:48.103Z',
  //used to hold the unit mapping
  units:null,
  model: DataSeriesModel,
  getTitle:function(){
    return this.title;
  },
  getDisplayName:function(){
    return this.displayName;
  },
  getStartDate:function(){
    return moment.utc(this.startdate).unix()*1000;
  },
  getEndDate:function(){
    return moment.utc(this.enddate).unix()*1000;
  },
  getSubtitle:function(){
    return this.stream;
  },
  getUnits:function(param){
    return this.units[param];
  },
  getPlotType:function(){
    return this.plottype;
  },
  parse: function(response, options) {
    this.units = response.units;
    this.title = response.title;
    return response.data;
  }

});

var InterpolatedDataSeriesCollection = Backbone.Collection.extend({
  /*  instr1:"telemetered_ctdgv_m_glider_instrument",
   instr2:"telemetered_flort_m_glider_instrument",
   ref_des1:"CP05MOAS-GL340-03-CTDGVM000",
   ref_des2:"CP05MOAS-GL340-02-FLORTM000",
   startdate:"2013-05-07T02:49:22.745Z",
   enddate:"2016-06-28T04:00:41.282Z",
   var1:"sci_water_pressure",
   var2:"sci_flbbcd_chlor_units",
   xaxislabel: "",
   yaxislabel: "",
   subtitle: "",*/

/*  defaults: {
    instr1:"",
    instr2:"",
    ref_des1:"",
    ref_des2:"",
    startdate:"",
    enddate:"",
    var1:"",
    var2:"",
    displayName:"",
    stream_display_name:""
  },*/

  initialize: function(models,options) {
    console.log('initialize options');
    console.log(options);
    if (options && options.instr1){
      this.instr1 = options.instr1;
    }
    if (options && options.instr2){
      this.instr2 = options.instr2;
    }
    if (options && options.ref_des1){
      this.ref_des1 = options.ref_des1;
    }
    if (options && options.ref_des2){
      this.ref_des2 = options.ref_des2;
    }
    if (options && options.startdate){
      this.startdate = options.startdate;
    }
    if (options && options.enddate){
      this.enddate = options.enddate;
    }
    if (options && options.var1){
      this.var1 = options.var1;
    }
    if (options && options.var2){
      this.var2 = options.var2;
    }
    if (options && options.displayName){
      this.displayName = options.displayName;
    }
    if (options && options.stream_display_name){
      this.stream_display_name = options.stream_display_name;
    }
  },


  url: function() {
    var durl = ('/api/get_multistream?instr1='+ this.instr1 + '&instr2=' + this.instr2 +
    "&ref_des1=" + this.ref_des1 + "&ref_des2=" + this.ref_des2 + "&var1=" + this.var1 +
    "&var2=" + this.var2 + "&startdate=" + this.startdate + "&enddate=" + this.enddate);
    console.log(durl);
    return durl;
  },
  //eg url: '/api/get_data?instrument=CE05MOAS-GL382-05-CTDGVM000&stream=telemetered_ctdgv_m_glider_instrument&xvars=time,time&yvars=sci_water_pressure,sci_water_cond&startdate=2015-01-21T22:01:48.103Z&enddate=2015-01-22T22:01:48.103Z',
  //used to hold the unit mapping
  units:null,
  model: DataSeriesModel,
  getTitle:function(){
    return this.title;
  },
  getStartDate:function(){
    return moment.utc(this.startdate).unix()*1000;
  },
  getEndDate:function(){
    return moment.utc(this.enddate).unix()*1000;
  },
  getSubtitle:function(){
    return this.subtitle;
  },
  getUnits:function(param){
    return this.units[param];
  },
  getPlotType:function(){
    return this.plottype;
  },
  parse: function(response, options) {
    console.log('response');
    console.log(response);
    this.units = response.units;
    this.title = response.title;
    this.subtitle = response.subtitle;
    return response.data;
  }

});
