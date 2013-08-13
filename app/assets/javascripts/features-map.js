
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
    if ($('#current-user').size() > 0)
      map.on("click", customMap.onClick);

    map.on("popupclose", customMap.onPopupClose);
    map.on("zoomend", customMap.onMapZoomEnd);

    L.DomEvent.on(document, 'keypress', this._onKeypress, this);

    L.GeoJSON.prototype.onAdd.call(this, map);
  },


  onRemove: function(map) {
    L.DomEvent.off(document, 'keypress', this._onKeypress, this);
    L.GeoJSON.prototype.onRemove.call(this, map);
  },

  _onKeypress: function(e) {
    var key = e.keyCode;

    if (key = 27) // ESC
      this._map.closePopup();
  },

  _markerShouldBeDraggable: function(m) {
    return (($('#current-user').data('admin') == true) ||
        ($('#current-user').data('uid') == m.properties.user_id)) &&
      (customMap._map.getZoom() >= 16);
  },

  _initMarker: function(m) {
    m.options.draggable = customMap._markerShouldBeDraggable(m);

    m.on("dragend", customMap.featureDragend, customMap);
    m.on("click", customMap.featureClick, customMap); 
  },

  onMapZoomEnd: function(e) {
    for (i in customMap._features) {
      var m = customMap._features[i];
      if (customMap._markerShouldBeDraggable(m)) {
        m.dragging.enable();
      } else {
        m.dragging.disable();
      }
    }
  },

  onPopupClose: function(e) {
    if (customMap._selectedFeature &&
        customMap._selectedFeature.properties.id == null) {
          customMap._map.removeLayer(customMap._selectedFeature);
          customMap._selectedFeature = null;
        }
  },

  onClick: function(e) {

    if (customMap._selectedFeature != null) {
      customMap._map.closePopup();
      customMap._selectedFeature = null;
      return;
    }

    if (customMap._map.getZoom() < 17) {
      customMap._map.setView(e.latlng, 17);
      return;
    }

    var m = new L.Marker(e.latlng);
    m.properties = {rating: 0, user_id: $('#current-user').data('uid')};
    customMap._initMarker(m);
    customMap._selectedFeature = m;
    customMap.setPopupContent(m, true);
    customMap._map.addLayer(m);
  },

  featureClick: function(e) {
    var f = e.target;

    customMap._selectedFeature = f;
    customMap.updatePopup(f);
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
  },

  zoomToFeature: function(featureId, zoomLevel) {
    var zoomLevel = zoomLevel || 16;
    var feature = customMap._features[featureId];

    if (feature == null)
      return false;

    customMap._selectedFeature = feature;

    customMap._map.setView(feature.getLatLng(), zoomLevel);
    customMap.updatePopup(feature);

    return true;
  },

  removeSelectedFeature: function() {
    customMap.removeFeature(customMap._selectedFeature.properties.id);
    customMap._selectedFeature = null;
  },

  removeFeature: function(featureId) {
    var feature = customMap._features[featureId];
    customMap._features[featureId] = null;
    customMap._map.removeLayer(feature);
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

  var params = {};
  var idx = window.location.href.indexOf('?');

  if (idx >= 0) {
    params = window.location.href.slice(idx + 1).split('&');
    for(var i = 0; i < params.length; i++) {
      var tmp = decodeURIComponent((params[i] + '').replace(/\+/g, '%20')).split('=');
      params[tmp[0]] = tmp[1];
    }
  }

  map = new L.Map('map');
  theMap = map;
  osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: 'Карта: © участники <a href="http://openstreetmap.org/">OpenStreetMap</a>'});

  featureLayer = new L.CustomMap();
  theCustomMap = featureLayer;

  L.Icon.Default.imagePath = '/assets';

//  minsk = new L.LatLng(53.901, 27.5545);
//  map.setView(minsk, 12);
  hrodna = new L.LatLng(53.6751, 23.8275);
  map.setView(hrodna, 12);
  map.addLayer(osm);
  map.addLayer(featureLayer);

  var attrib = new L.Control.Attribution({
    position: 'bottomleft',
    prefix: '© <a href="http://velogrodno.by/">velogrodno.by</a>'
  });

  map.addControl(attrib);

  $.getJSON('/features.json', function(data) {
    featureLayer.addData(data);

    if (params.feature != null) {
      featureLayer.zoomToFeature(params.feature);
    }

  });

  $('a.feature-top-item').click(function() {
    var id = this.id.replace('feature_top_item_', '');
    featureLayer.zoomToFeature(id);
  });
}

$(document).ready(init_map);

