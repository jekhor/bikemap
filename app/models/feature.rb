# encoding: utf-8

class Feature < ActiveRecord::Base

  belongs_to :user
  has_and_belongs_to_many :users_liked, :join_table => :features_users_likes, :class_name => 'User'

  attr_accessible :geometry, :name, :description, :capacity, :comment
  attr_accessible :photo, :existing, :approved, :address

  has_attached_file :photo,
    :styles => {:large => "800x600",
      :medium => "640x480>",
      :thumb => "100x100"
    }

  validates :description, :presence => true
  validates :geometry, :presence => true

  set_rgeo_factory_for_column(:latlon, RGeo::Geographic.spherical_factory(:srid => 4326))
  RGeo::ActiveRecord::GeometryMixin.set_json_generator(:geojson)

  comma do
    geometry t('feature.coordinates')
    existing t('feature.type') do |existing| existing ? t('feature.existing') : t('feature.needed') end
    rating t('feature.rating')
    description t('feature.description')
    address t('feature.address')
    comment t('feature.comment')
    capacity t('feature.capacity')
    approved t('feature.approved') do |approved| approved ? t('yes') : t('no') end
    created_at t('feature.created_at')
    user t('feature.user') do |user| user.name end
  end


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

  def toggle_like(user, vote)
    transaction do
      if self.users_liked.include? user
        if vote == 'dislike'
          self.users_liked.delete user
          self.rating -= 1
        end
      else
        if vote == 'like'
          self.users_liked << user
          self.rating += 1
        end
      end
      self.save
    end
  end

  def liked_by?(user)
    self.users_liked.include? user
  end

end
