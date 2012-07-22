class AddUserIdToComments < ActiveRecord::Migration
  def change
    add_column :comments, :user_id, :integer, :null => false
  end
end
