
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
      this.setPopupContent(this, m);
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

  _popupContentEditForm: function(feature) {
    var divForm = L.DomUtil.create('div', 'feature-edit', null);
    var form = L.DomUtil.create('form', null, divForm);

    var hiddens = '';
    hiddens = '<input name="fid" type="hidden" />';

    form.innerHTML = hiddens;

    var field = L.DomUtil.create('div', 'field', form);
    var label = L.DomUtil.create('label', null, field);
    label.textContent = "Name";
    label.setAttribute("for", "name");
    var input = L.DomUtil.create('input', null, field);
    input.setAttribute('type', 'text');
    input.setAttribute('name', 'name');
    input.setAttribute('id', 'name');
    input.textContent = feature.properties.name;

    var ok = L.DomUtil.create('input', null, form);
    ok.type = 'submit';
    ok.name = 'ok';
    ok.value = 'OK';

    return divForm;
  },

  setPopupContent: function(context, feature) {
    var div = L.DomUtil.create('div', 'feature-popup');

    div.appendChild(context._popupContentEditForm(feature));

    feature.bindPopup(div);
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

