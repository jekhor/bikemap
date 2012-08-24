class AddAddressToFeatures < ActiveRecord::Migration
  def change
    add_column :features, :address, :string

  end
end
