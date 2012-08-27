# encoding: utf-8

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

  def admin_logged_in?
    user_signed_in? && current_user.admin?
  end

  PROVIDERS_HASH = {
    'facebook' => 'Facebook',
    'vkontakte' => 'ВКонтакте',
    'google_oauth2' => 'Google',
    'mailru' => 'Mail.Ru'
  }

  def omniauth_provider_name(provider)
    name = PROVIDERS_HASH[provider.to_s]
    name = provider.to_s if name.nil?
    name
  end
end
