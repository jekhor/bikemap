class RenameLatlonToGeometryInFeatures < ActiveRecord::Migration
  def change
    change_table :features do |t|
      t.rename :latlon, :geometry
    end
  end
end
