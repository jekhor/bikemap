class AddAttachmentPhotoToFeatures < ActiveRecord::Migration
  def self.up
    change_table :features do |t|
      t.has_attached_file :photo
    end
  end

  def self.down
    drop_attached_file :features, :photo
  end
end
