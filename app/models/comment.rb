class Comment < ActiveRecord::Base
  belongs_to :feature

  validates :posted_on, :presence => true
  validates :text, :presence => true
end
