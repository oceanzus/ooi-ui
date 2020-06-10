"use strict";
/*
 * ooiui/static/js/views/common/CamImageView.js
 *
 * Dependencies
 * - slick
 * Partials
 * -
 * Libs
 * - ooiui/static/lib/underscore/underscore.js
 * - ooiui/static/lib/backbone/backbone.js
 * Usage
 */

var CamImageView = Backbone.View.extend({
    className: 'cam-image-list',
    events: {

    },
    initialize: function() {
        _.bindAll(this, "render");
    },
    template: _.template('<div id="camImageGallery"> </div>'),
    add:function(subview){
        this.$el.find('#camImageGallery').append(subview.el);
    },
    render: function(options) {
        var self = this;
        this.$el.html(this.template(options));

        this.collection.each(function(model) {
            var subview = new CamImageItemView({
                model: model
            });
            self.add(subview);
        });

        this.$el.find('#camImageGallery').slick({
            infinite: true,
            lazyLoad: 'ondemand',
            speed: 500,
            slidesToShow: 5,
            slidesToScroll: 5,
            dots: true
        });

    }
});

var CamImageItemView = Backbone.View.extend({
    className: 'cam-image-item',
    events: {
        "click a" : "itemClick"
    },
    initialize: function() {
        _.bindAll(this, "render","itemClick");
        this.render();
    },
    itemClick:function(evt){
        var self = this;
        evt.preventDefault();
        if (!_.isUndefined(self.model.get('url'))){
            var text = "<small>"+moment().utc(self.model.get("datetime")).format('YYYY-MM-DD')+"</small>";
            bootbox.dialog({
                title: "<h5>"+self.model.get("reference_designator")+"</h5>"+text,
                size:'large',
                message: "<a class='download-full-image' href='"+ self.model.get('url') +"' download='" + self.model.get('filename') +"' title='"+moment().utc(self.model.get("datetime")).format('YYYY-MM-DD')+"'><img height='100%' width='100%' src='" + self.model.get('url') + "'></a>",
                buttons: {
                    success: {
                        label: "Download Image",
                        className: "btn-success",
                        callback: function() {
                            $(this).find('.download-full-image img').click();
                        }
                    },
                    main: {
                        label: "Close",
                        className: "btn-default",
                        callback: function() {
                            //nothing and close
                        }
                    }
                }
            });
        }
    },
    template: JST['ooiui/static/js/partials/CamImageItem.html'],
    render: function(options) {
        this.$el.html(this.template({model:this.model}));
    }
});


var CamImageView2 = Backbone.View.extend({
    //className: 'cam-image-grid',
    daMap: {},
    dataBounds: {},
    $thumbnailgrid: null,
    filters: {},
    selectedRefDes: null,
    selectedYear: null,
    selectedMonth: null,
    selectedDay: null,
    selectedInstrumentGroup: null,
    events: {
        //'click input[name="instrument-types"]' : "instrumentTypeSelection",
        //"click .button#years-group" : "yearsButtonClick",
        //"click .filters .button" : "filterButtonClick",
        //"click .button#instruments-group" : "clickInstrumentsGroup"
    },
    initialize: function() {
        _.bindAll(this,
            "render",
            "instrumentTypeSelection",
            "yearsButtonClick",
            "monthsButtonClick",
            "daysButtonClick",
            "filterButtonClick",
            "clickInstrumentsGroup"
            );
    },
    template: _.template('<div class="thumbnail-grid"></div>'),
    concatValues: function(obj){
        let value = '';
        for ( let prop in obj ) {
            value += obj[ prop ];
        }
        return value;
    },
    // Clicked on the instrument type
    instrumentTypeSelection: function(event){
        //console.log('instrumentTypeSelection');
        //console.log(event);
        //event.preventDefault();

        let self = this;
        wavesurfer.pause();
        //var filterValue = $( this ).attr('data-filter');
        // use filterFn if matches value
        //filterValue = filterFns[ filterValue ] || filterValue;


        var $button = $( event.currentTarget );
        // get group key
        var $buttonGroup = $button.parents('.button-group');
        var filterGroup = event.target.dataset.filterGroup;
        // set filter for group
        self.filters[ filterGroup ] = event.target.attributes['data-filter-group'].value;
        let instrumentGroup = event.target.selectedOptions[0].title;
        self.selectedInstrumentGroup = instrumentGroup;
        //console.log('filters');
        //console.log(filters);
        // combine filters
        var filterValue = self.concatValues( self.filters );
        while(filterValue.includes("**"))
            filterValue = filterValue.replace("**", "*");
        //console.log('filterValue');
        //console.log(filterValue);

        self.$thumbnailgrid.isotope({ filter: filterValue });


        $('#selected-instrument-type-btn').empty();
        $('#selected-instrument-type-btn').append(event.target.selectedOptions[0].text);
        $('#selected-instrument-btn').empty();
        $('#selected-instrument-btn').append('Select Instrument');
        $('#selected-year-btn').empty();
        $('#selected-month-btn').empty();


        $('.element-item').remove();
        $('#years-group').empty();
        $('#months-group').empty();
        $('#days-group').empty();

        self.collectionInstruments.reset();

        let instrumentsSortedHtml = [];

        console.log(self.selectedInstrumentGroup);
        if (self.selectedInstrumentGroup === 'HYDBB') {
            $('#days-group-drop').show();
            // $.when(self.collectionInstruments.fetch({url: '/api/uframe/media/get_instrument_list/'+instrumentGroup})).done(function(data){
                //console.log(data);
                $('#instruments-group').empty();
                //$('#instruments-group').append('<button class="button is-checked" data-filter="*">Choose Instrument</button>');
                // let instrumentsSorted = data.instruments.sort();
                let instrumentsSorted = ['CE02SHBP-LJ01D-11-HYDBBA106'];

                $('#instruments-group').append('<option class="button" title="Select Instrument" disabled selected>Select Instrument</option>');
                $.each(instrumentsSorted, function(key, instrument){
                    //$.when(self.collectionVocab.fetch({url: '/api/uframe/streams_for/'+instrument})).done(function (vocab) {
                    $.when(self.collectionVocab.fetch({url: '/api/uframe/media/get_display_name/'+instrument})).done(function (vocab) {
                        //console.log(vocab);
                        $('#instruments-group').append('<option class="button" data-filter=".'+instrument+'" title="'+instrument+'" data-ref_des="'+instrument+'" data-long_name="'+vocab.vocab.long_name+'">'+vocab.vocab.long_name+'</option>');
                    });
                })
            // });
        } else {
            $('#days-group-drop').hide();
            $.when(self.collectionInstruments.fetch({url: '/api/uframe/media/get_instrument_list/'+instrumentGroup})).done(function(data){
                //console.log(data);
                $('#instruments-group').empty();
                //$('#instruments-group').append('<button class="button is-checked" data-filter="*">Choose Instrument</button>');
                let instrumentsSorted = data.instruments.sort();

                $('#instruments-group').append('<option class="button" title="Select Instrument" disabled selected>Select Instrument</option>');
                $.each(instrumentsSorted, function(key, instrument){
                    //$.when(self.collectionVocab.fetch({url: '/api/uframe/streams_for/'+instrument})).done(function (vocab) {
                    $.when(self.collectionVocab.fetch({url: '/api/uframe/media/get_display_name/'+instrument})).done(function (vocab) {
                        //console.log(vocab);
                        $('#instruments-group').append('<option class="button" data-filter=".'+instrument+'" title="'+instrument+'" data-ref_des="'+instrument+'" data-long_name="'+vocab.vocab.long_name+'">'+vocab.vocab.long_name+'</option>');
                    });
                })
            });
        }

        //$('#inst-type-menu-btn').removeClass('is-checked');
    },
    yearsButtonClick:function(event){
        //console.log('yearsButtonClick');
        //console.log(event);
        event.preventDefault();

        let self = this;

        wavesurfer.pause();

        // Clicked on a year
        // Go get the months
        let $button = $( event.currentTarget );
        let selectedYear = event.target.selectedOptions[0].value;
        self.selectedYear = selectedYear;
        let ref_des = event.target.selectedOptions[0].dataset['ref_des'];
        self.selectedRefDes = ref_des;

        $('.element-item').remove();
        $('#days-group').empty();


        $('#selected-year-btn').empty();
        $('#selected-year-btn').append(selectedYear);
        $('#selected-month-btn').empty();
        $('#selected-month-btn').append('Select Month');

        // Populate the months
        self.collectionMonths.reset();
        if (self.selectedInstrumentGroup === 'HYDBB') {
            $('#days-group-drop').show();
            // $.when(self.collectionMonths.fetch({url: '/api/uframe/media/'+ref_des+'/da/'+selectedYear}).done(function (data) {
                //console.log('months');
                //console.log(data);
                let months = ['1', '6'];
                $('#months-group').empty();
                //$('#instruments-group').append('<button class="button is-checked" data-filter="*">Choose Instrument</button>');
                $('#months-group').append('<option class="button" title="Select Month" disabled selected>Select Month</option>');
                $.each(months, function(key, month){
                    $('#months-group').append('<option class="button" data-filter=".'+month+'" title="'+month+'" data-ref_des="'+ref_des+'">'+month+'</option>');
                })
            // }))
        } else {
            $('#days-group-drop').hide();
            $.when(self.collectionMonths.fetch({url: '/api/uframe/media/'+ref_des+'/da/'+selectedYear}).done(function (data) {
                //console.log('months');
                //console.log(data);

                $('#months-group').empty();
                //$('#instruments-group').append('<button class="button is-checked" data-filter="*">Choose Instrument</button>');
                $('#months-group').append('<option class="button" title="Select Month" disabled selected>Select Month</option>');
                $.each(data.months, function(key, month){
                    $('#months-group').append('<option class="button" data-filter=".'+month+'" title="'+month+'" data-ref_des="'+ref_des+'">'+month+'</option>');
                })
            }))
        }

    },
    monthsButtonClick:function(event){
        //console.log('monthsButtonClick');
        //console.log(event);
        //event.preventDefault();

        let self = this;

        wavesurfer.pause();

        // Clicked on a year
        // Go get the months
        let $button = $( event.currentTarget );
        let selectedMonth = event.target.selectedOptions[0].title;
        self.selectedMonth = selectedMonth;
        let ref_des = event.target.selectedOptions[0].dataset['ref_des'];

        $('.element-item').remove();

        $('#selected-month-btn').empty();
        $('#selected-month-btn').append(selectedMonth);

        if (self.selectedInstrumentGroup === 'HYDBB') {
            $('#days-group-drop').show();
            let days = ['1', '10', '20'];
            $('#days-group').empty();
            //$('#instruments-group').append('<button class="button is-checked" data-filter="*">Choose Instrument</button>');
            $('#days-group').append('<option class="button" title="Select Day" disabled selected>Select Day</option>');
            $.each(days, function(key, day){
                $('#days-group').append('<option class="button" data-filter=".'+day+'" title="'+day+'" data-ref_des="'+ref_des+'">'+day+'</option>');
            })
        } else {
            $('#days-group-drop').hide();
            // Fetch the thumbnails and re-render
            self.collectionDataBounds.reset();
            $.when(self.collectionDataBounds.fetch({url: '/api/uframe/media/get_data_bounds/'+ref_des})).done(function(data){
                let first_date = data.bounds['first_date'];
                let last_date = data.bounds['last_date'];

                let chosenYear = $('#years-group').val();
                let chosenMonth = ("0" + $('#months-group').val()).slice(-2);

                $.when(self.collectionDays.fetch({url: '/api/uframe/media/'+ref_des+'/da/'+chosenYear+'/'+chosenMonth})).done(function (days) {
                    let firstDay = ("0" + days.days[0]).slice(-2);
                    let lastDay = ("0" + days.days.slice(-1)[0]).slice(-2);
                    first_date = [chosenYear, chosenMonth, firstDay].join("-");
                    last_date = [chosenYear, chosenMonth, lastDay].join("-");

                    $('#media-spinner').show();
                    $.when(self.collection.fetch({url: '/api/uframe/media/'+ref_des+'/range/'+first_date+'/'+last_date})).done(function(data){
                        //console.log(data);
                        self.render({'first_time': false})
                    });
                });
            });
        }

    },
    daysButtonClick:function(event){
        let self = this;

        // Clicked on a year
        // Go get the day
        let $button = $( event.currentTarget );
        let selectedDay = event.target.selectedOptions[0].title;
        self.selectedDay = selectedDay;
        let ref_des = event.target.selectedOptions[0].dataset['ref_des'];
        console.log(selectedDay);
        console.log(ref_des);

        wavesurfer.pause();

        $('#media-spinner').show();
        $('#wav-player-div').show();

        $.when(self.collectionHydbb.fetch({url: '/api/uframe/media/hydbb_test/'+ref_des+'/'+self.selectedYear+'/'+self.selectedMonth+'/'+self.selectedDay})).done(function(data){
            console.log(data);
            self.render({'first_time': false})
        });
    },
    filterButtonClick:function(event){
        //console.log('filterButtonClick');
        event.preventDefault();

        let self = this;

        //var filterValue = $( this ).attr('data-filter');
        // use filterFn if matches value
        //filterValue = filterFns[ filterValue ] || filterValue;

        var $button = $( event.currentTarget );
        // get group key
        var $buttonGroup = $button.parents('.button-group');
        var filterGroup = $buttonGroup.attr('data-filter-group');
        // set filter for group
        self.filters[ filterGroup ] = $button.attr('data-filter');
        //console.log('filters');
        //console.log(filters);
        // combine filters
        var filterValue = self.concatValues( self.filters );
        while(filterValue.includes("**"))
            filterValue = filterValue.replace("**", "*");
        //console.log('filterValue');
        //console.log(filterValue);

        $thumbnailgrid.isotope({ filter: filterValue });
    },
    // Clicked on the Instrument
    clickInstrumentsGroup:function(event){
        //console.log('clickInstrumentsGroup');
        //console.log(event);
        event.preventDefault();

        let self = this;

        let $button = $( event.currentTarget );
        let instrumentGroup = event.target.selectedOptions[0].title;
        console.log(instrumentGroup);
        let long_name = event.target.selectedOptions[0].value;

        $('.element-item').remove();
        $('#months-group').empty();
        $('#days-group').empty();

        $('#selected-instrument-btn').empty();
        $('#selected-instrument-btn').append(long_name);
        $('#selected-year-btn').empty();
        $('#selected-year-btn').append('Select Year');
        $('#selected-month-btn').empty();
        $('#selected-month-btn').append('Select Month');
        $('#selected-day-btn').empty();
        $('#selected-day-btn').append('Select Day');

        $('#selected-ref-des').empty();
        $('#selected-ref-des').append(instrumentGroup);

        wavesurfer.pause();

        self.collectionMap.reset();
        if (self.selectedInstrumentGroup === 'HYDBB') {
            $('#days-group-drop').show();
            // TODO: Change to keryx API to get the years listing
            // $.when(self.collectionMap.fetch({url: '/api/uframe/media/'+instrumentGroup+'/da/map'})).done(function(data){
            //     console.log(data);
                let years = ['2016'];
                $('#years-group').empty();
                //$('#years-group').append('<button class="button" data-filter="*" title="*">All Years</button>');

                $('#years-group').append('<option class="button" title="Select Year" disabled selected>Select Year</option>');
                $.each(years, function(key, year){
                    $('#years-group').append('<option class="button" data-filter=".'+year+'" title="'+year+'" data-ref_des="'+instrumentGroup+'">'+year+'</option>');
                });
            // });
        } else {
            $.when(self.collectionMap.fetch({url: '/api/uframe/media/'+instrumentGroup+'/da/map'})).done(function(data){
                //console.log(data);
                self.daMap = data;
                $('#years-group').empty();
                //$('#years-group').append('<button class="button" data-filter="*" title="*">All Years</button>');

                $('#years-group').append('<option class="button" title="Select Year" disabled selected>Select Year</option>');
                $.each(data.map, function(year, months){
                    $('#years-group').append('<option class="button" data-filter=".'+year+'" title="'+year+'" data-ref_des="'+instrumentGroup+'">'+year+'</option>');
                });
            });
        }

    },
    add:function(subview){
        this.$el.find('.thumbnail-grid').append(subview.el);
    },
    render: function(options) {
        //console.log('render');
        //console.log(options);
        let self = this;
        this.$el.html(this.template(options));

        $('#wav-player-div').hide();
        wavesurfer.pause();

        if(options['first_time']){
            $('#days-group-drop').hide();
            $('#media-spinner').hide();
            $('#wav-player-div').hide();
            // init Isotope
            self.$thumbnailgrid = $('.thumbnail-grid').isotope({
                itemSelector: '.element-item',
                layoutMode: 'packery',
                getSortData: {
                    name: '.name',
                    symbol: '.symbol',
                    number: '.number parseInt',
                    category: '[data-category]',
                    weight: function (itemElem) {
                        var weight = $(itemElem).find('.weight').text();
                        return parseFloat(weight.replace(/[\(\)]/g, ''));
                    },
                    year: '.year parseInt'
                }
            });

            // filter functions
            var filterFns = {
                // show if number is greater than 50
                numberGreaterThan50: function () {
                    var number = $(this).find('.number').text();
                    return parseInt(number, 10) > 50;
                },
                // show if name ends with -ium
                ium: function () {
                    var name = $(this).find('.name').text();
                    return name.match(/ium$/);
                },
                byYear: function () {
                    var year = $(this).find('.year').text();
                    //console.log(year);
                    return parseInt(year, 10) === 2019;
                }
            };

            // Clicked on the instrument type
            //$('[id^=instrument-types]').on('changed','.button', function(event){
            $('[id^=instrument-types]').change(function(event){
               self.instrumentTypeSelection(event)
            });

            // Clicked on the instrument
            $('[id^=instruments-group]').change(function(event){
               self.clickInstrumentsGroup(event)
            });

            $('[id^=years-group]').change(function(event){
               self.yearsButtonClick(event)
            });

            $('[id^=months-group]').change(function(event){
               self.monthsButtonClick(event)
            });

            $('[id^=days-group]').change(function(event){
               self.daysButtonClick(event)
            });

            // change is-checked class on buttons
            /*$('.button-group').each( function( i, buttonGroup ) {
                var $buttonGroup = $( buttonGroup );
                $buttonGroup.on( 'click', 'button', function() {
                    $buttonGroup.find('.is-checked').removeClass('is-checked');
                    $( this ).addClass('is-checked');
                });
                //$buttonGroup.find('.is-checked').click();
            });*/

            //$('#inst-type-menu-btn').click();
            //$('#inst-type-menu-btn').addClass('is-checked');
        } else {
            if (self.selectedInstrumentGroup === 'HYDBB') {
                $('#wav-player-div').show();
                if(this.collectionHydbb.length > 0) {
                    // Loop through the media and add to the image gallery
                    this.collectionHydbb.each(function (model) {
                        // console.log(model);
                        model.attributes['reference_designator'] = self.selectedRefDes;
                        model.attributes['date'] = self.selectedYear+'-'+self.selectedMonth+'-'+self.selectedDay;
                        model.attributes['baseUrl'] = 'http://ec2-3-213-152-122.compute-1.amazonaws.com:8088';
                        model.attributes['thumbnail'] = 'http://ec2-3-213-152-122.compute-1.amazonaws.com:8088'+model.attributes['thumbnail_path'];
                        model.attributes['url'] = 'http://ec2-3-213-152-122.compute-1.amazonaws.com:8088'+model.attributes['thumbnail_path'];

                        let subview = new CamImageItemView3({
                            model: model
                        });
                        // subview.setElement($('#cam-image-grid'));
                        self.add(subview);
                    });
                }
            } else {
                if(this.collection.length > 0) {
                    // Loop through the media and add to the image gallery
                    this.collection.each(function (model) {
                        console.log(model);
                        let subview = new CamImageItemView2({
                            model: model
                        });
                        // subview.setElement($('#cam-image-grid'));
                        self.add(subview);
                    });
                }
            }

            $('#media-spinner').hide();
        }
    }
});

var CamImageItemView2 = Backbone.View.extend({
    //className: 'element-item',
    events: {
        "click a" : "itemClick"
    },
    initialize: function() {
        _.bindAll(this, "render","itemClick");
        this.render();
    },
    itemClick:function(evt){
        var self = this;
        evt.preventDefault();
        //console.log(self.model);
        if (!_.isUndefined(self.model.get('url'))){
            var text = "<small>"+self.model.get("date")+"</small>";
            bootbox.dialog({
                title: "<h5>"+self.model.get("reference_designator")+"</h5>"+text,
                size:'large',
                message: "<a class='download-full-image' href='"+ self.model.get('url') +"' download='" + self.model.get('filename') +"' title='"+self.model.get("date")+"'><img height='100%' width='100%' src='" + self.model.get('url') + "'></a>",
                buttons: {
                    success: {
                        label: "Download Image",
                        className: "btn-success",
                        callback: function() {
                            $(this).find('.download-full-image img').click();
                        }
                    },
                    main: {
                        label: "Close",
                        className: "btn-default",
                        callback: function() {
                            //nothing and close
                        }
                    }
                }
            });
        }
    },
    template: JST['ooiui/static/js/partials/CamImageItem2.html'],
    render: function(options) {
        this.setElement(this.template({model:this.model}));
    }
});

var CamImageItemView3 = Backbone.View.extend({
    //className: 'element-item',
    events: {
        "click a" : "itemClick"
    },
    initialize: function() {
        _.bindAll(this, "render","itemClick");
        this.render();
    },
    itemClick:function(evt){
        var self = this;
        evt.preventDefault();
        //console.log(self.model);
        if (!_.isUndefined(self.model.get('url'))){
            var text = "<small>"+self.model.get("date")+"</small>";
            let wav_file = self.model.get("url").replace('.png', '.wav').replace('thumbnails', 'wav_files');
            console.log(wav_file);
            wavesurfer.load(wav_file);
            $('#wav-player-div').show();
            bootbox.dialog({
                title: "<h5>"+self.model.get("reference_designator")+"</h5>"+text,
                size:'large',
                message: "<a class='download-full-image' href='"+ self.model.get('url') +"' download='" + self.model.get('filename') +"' title='"+self.model.get("date")+"'><img height='100%' width='100%' src='" + self.model.get('url') + "'></a>",
                buttons: {
                    success: {
                        label: "Download Image",
                        className: "btn-success",
                        callback: function() {
                            $(this).find('.download-full-image img').click();
                        }
                    },
                    main: {
                        label: "Close",
                        className: "btn-default",
                        callback: function() {
                            //nothing and close
                            //wavesurfer.pause();
                        }
                    }
                }
            });
        }
    },
    template: JST['ooiui/static/js/partials/CamImageItem3.html'],
    render: function(options) {
        this.setElement(this.template({model:this.model}));
    }
});
