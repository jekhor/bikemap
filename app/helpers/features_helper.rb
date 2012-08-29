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

  def link_to_sort(text, options)
    sort = options[:sort]
    options[:sort] = sort + ' DESC' if @sorted_by == sort
    
    raw link_to text, options
  end
end
