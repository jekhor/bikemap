class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.integer :feature_id, :null => false
      t.text :text, :null => false
      t.datetime :posted_on, :null => false
    end

    add_index :comments, :feature_id, :unique => true
  end
end
