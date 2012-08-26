module FeaturesHelper
  def get_likebutton_img(type, enabled)
    case type
    when 'like'
      img = 'plus'
    when 'dislike'
      img = 'minus'
    end
    img += '-disabled' unless enabled
    img += '-24px.png'
    img
  end
end
