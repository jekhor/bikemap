class Feature < ActiveRecord::Base

  belongs_to :user

  attr_accessible :geometry, :name, :description, :capacity, :comment
  attr_accessible :photo, :existing, :approved

  has_attached_file :photo,
    :styles => {:large => "800x600",
      :medium => "640x480>",
      :thumb => "100x100"
    }

  validates :description, :presence => true
  validates :geometry, :presence => true

  set_rgeo_factory_for_column(:latlon, RGeo::Geographic.spherical_factory(:srid => 4326))
  RGeo::ActiveRecord::GeometryMixin.set_json_generator(:geojson)

  def as_json(params)
    properties = self.attributes.dup
    properties.delete('geometry')
    hash = {:type => 'Feature', :geometry => self.geometry, :properties => properties}
    hash.as_json
  end

  def self.from_json(params)
    f = self.new
    coordinates = params["geometry"]["coordinates"]
    f.geometry = "POINT(#{coordinates[0]} #{coordinates[1]})"
    logger.debug "from_json: "
    logger.debug f.geometry.inspect

    unless params["properties"].nil?
      params["properties"].each_pair do |key, val|
        f.send(key+'=', val)
      end
    end

    f
  end

end
