class AddExistingToFeatures < ActiveRecord::Migration
  def change
    add_column :features, :existing, :boolean, :default => false
  end
end
