class AddApprovedToFeatures < ActiveRecord::Migration
  def change
    add_column :features, :approved, :boolean, :default => false

  end
end
