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

  def sortable(column, title = nil)
    css_class = column == sort_column ? "current #{sort_direction}" : nil
    direction = column == sort_column && sort_direction == "asc" ? "desc" : "asc"
    link_to title, {:sort => column, :direction => direction, :existing => show_existing }, {:class => css_class}
  end

  def link_to_existing(title, existing)
    css_class = (existing == show_existing) ? 'active' : nil
    link_to title, {:sort => sort_column, :direction => sort_direction, :existing => existing}, {:class => css_class}
  end
end
