class RemoveFeatureIdFromComments < ActiveRecord::Migration
  def change
    remove_column :comments, :feature_id
  end
end
