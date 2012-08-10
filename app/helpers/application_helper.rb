module ApplicationHelper
  def javascript(*files)
    content_for(:head) { javascript_include_tag(*files) }
  end

  def link_to_user(user)
    output = ''
    output += image_tag "button-#{user.provider}.png", :class => 'user-icon' if user.provider
    output += link_to current_user.name, edit_user_registration_path
    raw output
  end
end
