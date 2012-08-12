class Comment < ActiveRecord::Base
  belongs_to :user

  attr_accessible :text

  validates :posted_on, :presence => true
  validates :text, :presence => true
  validates :user_id, :presence => true

  self.per_page = 10
end
