
L.CustomMap =  L.GeoJSON.extend({

  options: {
  },

  customMap: null,

  initialize: function(geojson, options) {
    customMap = this;
    var _this = this;

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
    this.setPopupContent(e.layer);
  },

  onAdd: function(map) {
    this._map = map;
    map.on("click", function (e) {
      var m = new L.Marker(e.latlng);
      m.properties = {rating: 0};
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
        _this.setPopupContent(feature, true);
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

  _popupContentCommentForm: function(feature) {
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
          customMap.updatePopup(feature);
        }
      });

      return false;
    }

    var div = L.DomUtil.create('div', 'comment-edit');
    div.appendChild(form);

    return div;
  },

  updatePopup: function(feature) {
    feature.closePopup();
    customMap.setPopupContent(feature);
    feature.openPopup();
  },

  _popupContentShow: function(feature) {
    var div = L.DomUtil.create('div');

    var header = L.DomUtil.create('h3', null, div);

    return div;
  },

  updateRating: function(feature, vote) {
    $.ajax({
      url: '/features/' + feature.properties.id + '/update_rating/' + vote,
      type: 'GET',
      dataType: 'json',
      success: function(data, textStatus, jqXHR) {
        feature.properties.rating = data;
        $('#feature-popup-rating', feature._popupContent).text(data);
      }
    });
  },

  setPopupContent: function(feature, newFeature) {
    newFeature = newFeature || false;
    var popupDiv = L.DomUtil.create('div', 'feature-popup');
    var action = newFeature ? '/popup-edit-form' : '/popup';

    $.get('/features/' + feature.properties.id + action, null, function(responseText, textStatus, XMLHttpRequest) {
      popupDiv.innerHTML = responseText;
      feature.bindPopup(popupDiv);
      feature._popupContent = popupDiv;

      $('#feature-popup-like', popupDiv).click(function(e) {
        customMap.updateRating(feature, 1);
      });

      $('#feature-popup-dislike', popupDiv).click(function(e) {
        customMap.updateRating(feature, -1);
      });

      $('#edit-link', popupDiv).click(function(e) {
        $('.feature-popup').load('/features/' + feature.properties.id + '/popup-edit-form', function (){
        feature.closePopup();
        feature.openPopup();
        });
      });

      $('a[rel*="lightbox"]', popupDiv).lightBox();

      if (newFeature) {
        feature.openPopup();
      }
    }, 'html');
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

