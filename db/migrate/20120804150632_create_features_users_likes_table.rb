class CreateFeaturesUsersLikesTable < ActiveRecord::Migration
  def change
    create_table :features_users_likes, :id => false do |t|
      t.integer :feature_id
      t.integer :user_id
    end
  end
end
