
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
      var iconClass = geojson.properties.existing ? 'leaflet-div-icon-existing' : 'leaflet-div-icon-desired';
   
      var icon = new L.DivIcon({
        iconSize: new L.Point(24, 24),
        html: '<strong>' + geojson.properties.rating + '</strong>',
        className: iconClass
      });

      var m = new L.Marker(latlng, {
        icon: icon
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
      m.options.draggable = true;
      m.on("dragend", customMap.featureDragend, customMap);
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
    var action = '';
    var ll = feature.getLatLng();
    var geometry = 'POINT(' + ll.lng + ' ' + ll.lat + ')';
    
    action += newFeature ? 'new?geometry=' + geometry : feature.properties.id;

    $.get('/features/' + action, null, function(responseText, textStatus, XMLHttpRequest) {
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
        customMap.updateRating(feature, 1);
      });

      $('#feature-popup-dislike', popupDiv).click(function(e) {
        customMap.updateRating(feature, -1);
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

