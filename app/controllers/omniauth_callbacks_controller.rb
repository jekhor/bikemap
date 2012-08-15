# encoding: utf-8

class OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def facebook
    # You need to implement the method below in your model (e.g. app/models/user.rb)
    @user = User.find_for_facebook_oauth(request.env["omniauth.auth"], current_user)

    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Facebook"
      sign_in_and_redirect @user, :event => :authentication
    else
      session["devise.facebook_data"] = request.env["omniauth.auth"]
      flash[:alert] = @user.errors.full_messages.join("<br/>") if @user.errors.any?
      redirect_to new_user_registration_url
    end
  end

  def vkontakte
    # You need to implement the method below in your model (e.g. app/models/user.rb)
    @user = User.find_for_vkontakte_oauth(request.env["omniauth.auth"], current_user)

    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "ВКонтакте"
      sign_in_and_redirect @user, :event => :authentication
    else
      session["devise.vkontakte_data"] = request.env["omniauth.auth"]
      flash[:alert] = @user.errors.full_messages.join("<br/>") if @user.errors.any?
      redirect_to new_user_registration_url
    end
  end

  def google_oauth2
    # You need to implement the method below in your model (e.g. app/models/user.rb)
    @user = User.find_for_google_oauth2(request.env["omniauth.auth"], current_user)

    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Google"
      sign_in_and_redirect @user, :event => :authentication
    else
      session["devise.google_oauth2_data"] = request.env["omniauth.auth"]
      flash[:alert] = @user.errors.full_messages.join("<br/>") if @user.errors.any?
      redirect_to new_user_registration_url
    end
  end

  def mailru
    # You need to implement the method below in your model (e.g. app/models/user.rb)
    @user = User.find_for_mailru_oauth(request.env["omniauth.auth"], current_user)

    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Mail.Ru"
      sign_in_and_redirect @user, :event => :authentication
    else
      session["devise.mailru_oauth_data"] = request.env["omniauth.auth"]
      flash[:alert] = @user.errors.full_messages.join("<br/>") if @user.errors.any?
      redirect_to new_user_registration_url
    end
  end
end
