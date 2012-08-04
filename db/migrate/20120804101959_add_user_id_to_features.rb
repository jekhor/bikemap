class AddUserIdToFeatures < ActiveRecord::Migration
  def change
    add_column :features, :user_id, :integer

  end
end
