
L.CustomMap =  L.GeoJSON.extend({

  options: {
  },

  initialize: function(geojson, options) {

    _this = this;
    pointToLayer = function(latlng) {
      var m = new L.Marker(latlng);
      m.options.draggable = true;
      m.on("dragend", _this.featureDragend, _this);
      return m;
    };

    this.options["pointToLayer"] = pointToLayer;
    options = L.Util.setOptions(this, options);
    L.GeoJSON.prototype.initialize.call(this, geojson, options);

    this.on("featureparse", this.featureParse, this);
  },


  featureParse: function(e) {
    e.layer.properties = e.properties;
    this.setPopupContent(this, e.layer);
  },

  onAdd: function(map) {
    this._map = map;
    map.on("click", function (e) {
      var m = new L.Marker(e.latlng);
      m.properties = {};
      m.options.draggable = true;
      m.on("dragend", this.featureDragend, this);
      this.postFeature(m);
    }, this);

    L.GeoJSON.prototype.onAdd.call(this, map);
  },


  onRemove: function(map) {
    L.GeoJSON.prototype.onRemove.call(this, map);
  },

  postFeature: function(feature) {
    var _this = this;
    latlng = feature.getLatLng();
    json_feature = {
      'type': 'Feature',
      'properties': feature.properties,
      'geometry': {
        'type': 'Point',
        'coordinates': [latlng.lng, latlng.lat]
      }
    }

    $.ajax({
      url: '/features',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(json_feature),
      contentType: 'application/json',
      success: function(data, textStatus, jqXHR) {
        feature.properties.id = data.properties.id;
        _this._map.addLayer(feature);
        _this.setPopupContent(_this, feature);
        feature.openPopup();
      }
    });
  },


  updateFeature: function(feature) {
    latlng = feature.getLatLng();
    json_feature = {
      'type': 'Feature',
      'properties': feature.properties,
      'geometry': {
        'type': 'Point',
        'coordinates': [latlng.lng, latlng.lat]
      }
    }

    $.ajax({
      url: '/features/' + feature.properties['id'],
      type: 'PUT',
      dataType: 'json',
      data: JSON.stringify(json_feature),
      contentType: 'application/json',
    });
  },


  featureDragend: function(e) {
    this.updateFeature(e.target);
  },

  _popupContentCommentForm: function(_this, feature) {
    var content = '';
    content += '<form id="comment-edit-form"><input name="feature_id" type="hidden" value="${feature_id}" />';
    content += '<input name="comment" type="text" id="comment" />';
    content += '<input type="submit" value="Post" />';
    content += '</form>';

    var form = $.tmpl(content, {feature_id: feature.properties.id})[0];
    form.onsubmit = function(e) {
      json = {
        feature_id: this.feature_id.value,
        text: this.comment.value
      }
      $.ajax({
        url: '/features/' + this.feature_id.value + '/comments',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify(json),
        contentType: 'application/json',
        success: function(data, textStatus, jqXHR) {
          _this.updatePopup(_this, feature);
        }
      });

      return false;
    }

    var div = L.DomUtil.create('div', 'comment-edit');
    div.appendChild(form);

    return div;
  },

  updatePopup: function(_this, feature) {
    feature.closePopup();
    _this.setPopupContent(_this, feature);
    feature.openPopup();
  },

  _popupContentShow: function(_this, feature) {
    var div = L.DomUtil.create('div');

    var header = L.DomUtil.create('h3', null, div);

    return div;
  },

  updateRating: function(_this, feature, vote) {
    $.ajax({
      url: '/features/' + feature.properties.id + '/update_rating/' + vote,
      type: 'GET',
      dataType: 'json',
      success: function(data, textStatus, jqXHR) {
        feature.properties.rating = data;
        _this.updatePopup(_this, feature);
      }
    });
  },

  setPopupContent: function(context, feature) {
    var popupDiv = L.DomUtil.create('div', 'feature-popup');
    var header = L.DomUtil.create('div', 'feature-popup-header', popupDiv);

    var mainContent = L.DomUtil.create('div', 'feature-popup-main', popupDiv);

    var icon = L.DomUtil.create('img', 'feature-popup-icon', header);
    icon.src = feature.options.icon._getIconUrl('icon');

    var rating = L.DomUtil.create('div', 'feature-popup-rating', header);
    var ratingUp = L.DomUtil.create('span', 'feature-popup-rating-up-icon', rating);
    ratingUp.textContent = 'Up ';
    ratingUp.onclick = function(e) {
      context.updateRating(context, feature, 1);
    }

    var ratingValue = L.DomUtil.create('span', 'feature-popup-rating-value', rating);
    ratingValue.textContent = feature.properties.rating;
    var ratingDown = L.DomUtil.create('span', 'feature-popup-rating-down-icon', rating);
    ratingDown.textContent = ' Down';
    ratingDown.onclick = function(e) {
      context.updateRating(context, feature, -1);
    }

    var navigationBar = L.DomUtil.create('div', 'feature-popup-navigation', header);
    var navList = L.DomUtil.create('ul', null, navigationBar);
    var navitem = L.DomUtil.create('li', null, navList);

    var commentDiv = L.DomUtil.create('div', 'feature-comments', popupDiv);
    if (feature.properties.id) {
      $.ajax({
        url: '/features/' + feature.properties.id + '/comments',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        data: null,
        success: function(data, textStatus, jqXHR) {
          var i;
          for (i = 0; i < data.length; i++) {
            var comment = '';
            comment += '<div class="comment">';
            comment += '<div class="comment-date">${posted_on}</div>';
            comment += '<div class="comment-text">${text}</div>';
            comment += '</div>';

            var tmp = $.tmpl(comment, data[i]).appendTo(commentDiv);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          commentDiv.textContent = textStatus;
        }
      });
    }

    popupDiv.appendChild(context._popupContentCommentForm(context, feature));


    feature.bindPopup(popupDiv);
  },
});

init_map = function() {
  map = new L.Map('map');
  osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: 'OSM'});

  featureLayer = new L.CustomMap();

  L.Icon.Default.imagePath = '/assets';

  minsk = new L.LatLng(53.901, 27.5545);
  map.setView(minsk, 12);
  map.addLayer(osm);
  map.addLayer(featureLayer);

  $.getJSON('/features.json', function(data) {
    featureLayer.addGeoJSON(data);
  })
}

$(document).ready(init_map);

