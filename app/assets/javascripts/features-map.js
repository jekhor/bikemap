
L.CustomMap =  L.GeoJSON.extend({

  options: {
  },

  customMap: null,

  _features: [],
  _map: null,
  _popupOpened: null,
  _selectedFeature: null,

  initialize: function(geojson, options) {
    customMap = this;
    var _this = this;

    pointToLayer = function(geojson) {
      var coords = geojson.geometry.coordinates;
      var latlng = new L.LatLng(coords[1], coords[0]);
      var m = new L.Marker(latlng, {
        icon: customMap._createFeatureIcon(geojson.properties)
      });
      m.properties = geojson.properties;
      customMap._features[m.properties.id] = m;
      customMap._initMarker(m);
      return m;
    };

    this.options["pointToLayer"] = pointToLayer;
    options = L.Util.setOptions(this, options);
    L.GeoJSON.prototype.initialize.call(this, geojson, options);

  },

  _createFeatureIcon: function(properties) {
      var iconClass = properties.existing ? 'leaflet-div-icon-existing' : 'leaflet-div-icon-desired';
      if (!properties.approved) {
        iconClass += ' feature-notapproved';
      }
   
      var icon = new L.DivIcon({
        iconSize: new L.Point(24, 24),
        html: '<strong>' + properties.rating + '</strong>',
        className: iconClass
      });

      return icon;
  },

  onAdd: function(map) {
    customMap._map = map;
    map.on("click", customMap.onClick);
    map.on("popupclose", customMap.onPopupClose);

    L.GeoJSON.prototype.onAdd.call(this, map);
  },


  onRemove: function(map) {
    L.GeoJSON.prototype.onRemove.call(this, map);
  },

  _initMarker: function(m) {
    if ($('#current-user').data('admin') ||
        ($('#current-user').data('uid') == m.properties.user_id)) {

      m.options.draggable = true;
      m.on("dragend", customMap.featureDragend, customMap);
    }

    m.on("click", customMap.featureClick, customMap); 
  },

  onPopupClose: function(e) {
    if (customMap._selectedFeature &&
        customMap._selectedFeature.properties.id == null) {
          customMap._map.removeLayer(customMap._selectedFeature);
          customMap._selectedFeature = null;
        }
  },

  onClick: function(e) {
    var m = new L.Marker(e.latlng);
    m.properties = {rating: 0};
    customMap._initMarker(m);
    customMap._selectedFeature = m;
    customMap.setPopupContent(m, true);
    customMap._map.addLayer(m);
//    this.postFeature(m);
  },

  featureClick: function(e) {
    var f = e.target;

    customMap._selectedFeature = f;
    customMap.updatePopup(f);
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
        customMap._features[feature.properties.id] = feature;
        _this._map.addLayer(feature);
//        _this.setPopupContent(feature, true);
      }
    });
  },


  updateFeatureGeometry: function(feature) {
    latlng = feature.getLatLng();
    json_feature = {
      'type': 'Feature',
      'properties': {'id': feature.properties['id']},
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
    this.updateFeatureGeometry(e.target);
  },

  updatePopup: function(feature) {
    feature.bindPopup('<div class="popup-loading"></div>');
    feature.openPopup();
    customMap.setPopupContent(feature);
  },

  _popupContentShow: function(feature) {
    var div = L.DomUtil.create('div');

    var header = L.DomUtil.create('h3', null, div);

    return div;
  },

  toggleLike: function(feature, vote) {
    feature = feature || customMap._selectedFeature;
    $.ajax({
      url: '/features/' + feature.properties.id + '/toggle_like/' + vote,
      type: 'GET',
      dataType: 'script',
/*      success: function(data, textStatus, jqXHR) {
        feature.properties.rating = data;
        $('#feature-popup-rating', feature._popupContent).text(data);
      }*/
    });
  },

  setPopupContent: function(feature, newFeature) {
    newFeature = newFeature || false;
    var popupDiv = L.DomUtil.create('div', 'feature-popup');
    var action = '';
    var ll = feature.getLatLng();
    var geometry = 'POINT(' + ll.lng + ' ' + ll.lat + ')';
    
    action += newFeature ? 'new?geometry=' + geometry : feature.properties.id;

    $.ajax({
      url: '/features/' + action,
      type: 'GET',
      dataType: 'script',
    });

    /*TODO!!! Switch to rails-driven rendering & JS */
/*    $.get('/features/' + action, null, function(responseText, textStatus, XMLHttpRequest) {
      popupDiv.innerHTML = responseText;
      feature.bindPopup(popupDiv);
      feature._popupContent = popupDiv;

      $('input.cancel', popupDiv).click(function(e) {
        customMap._map.closePopup();
        if (newFeature) {
          customMap._map.removeLayer(feature);
        }
        return false;
      });

      $('#feature-popup-like', popupDiv).click(function(e) {
        customMap.toggleLike(feature);
      });

      $('#edit-link', popupDiv).click(function(e) {
        $('.feature-popup').load('/features/' + feature.properties.id + '/edit', function (){
          feature.closePopup();
          feature.openPopup();
          $('input.cancel', popupDiv).click(function(e) {
            customMap._map.closePopup();
            return false;
          });
        });
      });

      $('a[rel*="lightbox"]', popupDiv).lightBox();

//      if (newFeature) {
        feature.closePopup();
        feature.openPopup();
//      }
    }, 'html');
*/
  },

  zoomToFeature: function(featureId, zoomLevel) {
    zoomLevel = zoomLevel || 16;
    feature = customMap._features[featureId];

    customMap._map.setView(feature.getLatLng(), zoomLevel);
    customMap.updatePopup(feature);
  },

  removeSelectedFeature: function() {
    customMap._map.removeLayer(customMap._selectedFeature);
    customMap._selectedFeature = null;
  },

  reloadFeature: function(featureId) {
    var feature = customMap._features[featureId];

    $.ajax({
      url: '/features/' + featureId,
      type: 'GET',
      dataType: 'json',
      data: null,
      contentType: 'application/json',
      success: function(data, textStatus, jqXHR) {
        feature.properties = data.properties;
        feature.setLatLng(new L.LatLng(data.geometry.coordinates[1], data.geometry.coordinates[0]));
        feature.setIcon(customMap._createFeatureIcon(data.properties));
        customMap.setPopupContent(feature);
      }
    });
  },
});

var theMap = null;
var theCustomMap = null;

init_map = function() {
  map = new L.Map('map');
  theMap = map;
  osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: 'OSM'});

  featureLayer = new L.CustomMap();
  theCustomMap = featureLayer;

  L.Icon.Default.imagePath = '/assets';

//  minsk = new L.LatLng(53.901, 27.5545);
//  map.setView(minsk, 12);
  hrodna = new L.LatLng(53.6751, 23.8275);
  map.setView(hrodna, 12);
  map.addLayer(osm);
  map.addLayer(featureLayer);

  $.getJSON('/features.json', function(data) {
    featureLayer.addData(data);
  });

  $('a.feature-top-item').click(function() {
    var id = this.id.replace('feature_top_item_', '');
    featureLayer.zoomToFeature(id);
  });
}

$(document).ready(init_map);

