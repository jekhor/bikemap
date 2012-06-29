class Feature < ActiveRecord::Base
  attr_accessible :geometry, :name

  set_rgeo_factory_for_column(:latlon, RGeo::Geographic.spherical_factory(:srid => 4326))
  RGeo::ActiveRecord::GeometryMixin.set_json_generator(:geojson)

  def as_json(params)
    properties = self.attributes.dup
    properties.delete('geometry')
    hash = {:geometry => self.geometry, :properties => properties}
    hash.as_json
  end

end
