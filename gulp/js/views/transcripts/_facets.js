app.views.TranscriptFacets = app.views.Base.extend({

  template: _.template(TEMPLATES['transcript_facets.ejs']),

  events: {
    "click .filter-by": "filterFromEl",
    "click .sort-by": "sortFromEl",
    "submit .search-form": "searchFromForm",
    "keyup .search-form input": "searchFromInput"
  },

  initialize: function(data){
    this.data = _.extend({}, data);

    this.initFacets();

    // turn sticky on
    $(window).trigger('sticky-on', ['#header']);
  },

  filter: function(name, value){
    PubSub.publish('transcripts.filter', {name: name, value: value});
  },

  filterFromEl: function(e){
    var $el = $(e.currentTarget);

    this.filter($el.attr('data-filter'), $el.attr('data-value'));
  },

  initFacets: function(){
    // set defaults
    var active_collection_id = 'ALL';
    var active_sort = 'title';
    var active_order = 'asc';
    var active_keyword = '';

    // check for query params
    if (this.data.queryParams) {
      var params = this.data.queryParams;
      if (params.sort_by) active_sort = params.sort_by;
      if (params.order) active_order = params.order;
      if (params.collection_id) active_collection_id = params.collection_id;
      if (params.keyword) active_keyword = params.keyword;
    }

    // add an "all collections" options
    if (this.data.collections.length) {
      var all_collections = {
        id: 'ALL',
        title: 'All Collections'
      };
      this.data.collections.unshift(all_collections);
      this.data.collections = _.map(this.data.collections, function(c){
        c.active = false;
        if (c.id == active_collection_id) c.active = true;
        return c;
      });
      this.data.active_collection = _.findWhere(this.data.collections, {active: true});
    }

    // set sort option
    this.data.sort_options = [
      {id: 'title_asc', name: 'title', order: 'asc', label: 'Title (A to Z)'},
      {id: 'title_desc', name: 'title', order: 'desc', label: 'Title (Z to A)'},
      {id: 'percent_completed_desc', name: 'percent_completed', order: 'desc', label: 'Completeness (most to least)'},
      {id: 'percent_completed_asc', name: 'percent_completed', order: 'asc', label: 'Completeness (least to most)'},
      {id: 'duration_asc', name: 'duration', order: 'asc', label: 'Duration (short to long)'},
      {id: 'duration_desc', name: 'duration', order: 'desc', label: 'Duration (long to short)'},
      {id: 'collection_asc', name: 'collection_id', order: 'asc', label: 'Collection'}
    ];
    this.data.sort_options = _.map(this.data.sort_options, function(option){
      option.active = false;
      if (option.name == active_sort && option.order == active_order) option.active = true;
      return option;
    });
    this.data.active_sort = _.findWhere(this.data.sort_options, {active: true});

    // set keyword
    this.data.active_keyword = active_keyword;
  },

  render: function(){
    this.$el.html(this.template(this.data));
    return this;
  },

  search: function(keyword){
    PubSub.publish('transcripts.search', keyword);
  },

  searchFromForm: function(e){
    e.preventDefault();
    var $form = $(e.currentTarget),
        keyword = $form.find('input[name="keyword"]').val();

    keyword = keyword.trim().toLowerCase();

    this.search(keyword);
  },

  searchFromInput: function(e){
    var $input = $(e.currentTarget),
        keyword = $input.val();

    keyword = keyword.trim();

    // only submit if empty
    if (!keyword.length)
      this.search(keyword);
  },

  sortTranscripts: function(name, order){
    PubSub.publish('transcripts.sort', {name: name, order: order});
  },

  sortFromEl: function(e){
    var $el = $(e.currentTarget);

    this.sortTranscripts($el.attr('data-sort'), $el.attr('data-order'));
  }

});
