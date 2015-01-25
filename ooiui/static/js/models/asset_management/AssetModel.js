"use strict";
/*
 * ooiui/static/js/models/common/RoleModel.js
 * Model definitions for Organizations
 *
 * Dependencies
 * Libs
 * - ooiui/static/lib/underscore/underscore.js
 * - ooiui/static/lib/backbone/backbone.js
 * - ooiui/static/js/ooi.js
 *
 * Usage
 *
 */

var AssetModel = Backbone.Model.extend({
  urlRoot: "/api/organization",
  defaults: {
    organization_name: ""
  }
});

var Assets = Backbone.Collection.extend({
  url: '/api/organization',
  model: AssetModel,
  parse: function(response) {
    return response.organizations;
  }
});