class AddRatingToFeatures < ActiveRecord::Migration
  def change
    add_column :features, :rating, :integer, :default => 0
  end
end
