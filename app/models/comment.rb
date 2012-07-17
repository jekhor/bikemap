class Comment < ActiveRecord::Base
  validates :posted_on, :presence => true
  validates :text, :presence => true
end
