class AddFieldsToFeatures < ActiveRecord::Migration
  def change
    change_table :features do |t|
      t.string :description
      t.integer :capacity
      t.text :comment
    end
  end
end
