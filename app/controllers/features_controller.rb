# encoding: utf-8

class FeaturesController < ApplicationController
  before_filter :authenticate_user!, :except => [:index, :show, :map, :feed]
  helper_method :have_edit_permissions?
  helper_method :sort_column, :sort_direction, :show_existing

  private
  def have_edit_permissions?(feature)
    return false if current_user.nil?
    current_user.admin? or feature.user == current_user
  end

  public

  # GET /features
  # GET /features.json
  def index
    if !user_signed_in?
      @features = Feature.where(:approved => true)
    else
      if current_user.admin?
        @features = Feature.where('')
      else
        @features = Feature.where('approved = ? OR user_id = ?', true, current_user.id)
      end
    end

    respond_to do |format|
      format.html {
        params[:sort] ||= 'rating'
        params[:direction] ||= 'desc'
        @features = @features.where(:existing => show_existing)
        @features = @features.order(sort_column + ' ' + sort_direction)
      } # index.html.erb

      format.json {
        feature_collection = {:type => 'FeatureCollection', :features => @features}
        render json: feature_collection
      }
      format.csv { render csv: @features, :filename => 'bikeparkings' }
    end
  end

  def feed
    if params[:show_unapproved]
      @title = "Карта велоточек — для модераторов"
      @features = Feature.order('created_at DESC')
    else
      @title = "Карта велоточек — последние"
      @features = Feature.where(:approved => true).order('created_at DESC')
    end

    @updated = @features.first.updated_at unless @features.empty?

    respond_to do |format|
      format.rss { redirect_to feed_path(:format => :atom), :status => :moved_permanently }
      format.atom
    end
  end

  # GET /features/1
  # GET /features/1.json
  def show
    @feature = Feature.find(params[:id])
    @title = @feature.existing? ? "Место" : "Cтанция проката"
    @liked = @feature.users_liked.include? current_user if user_signed_in?

    respond_to do |format|
      format.html {render :layout => 'feature-popup'}
      format.json { render json: @feature }
      format.js
    end
  end

  # GET /features/new
  # GET /features/new.json
  def new
    @title = "Создание новой точки"
    @subtitle = "Пожалуйста, заполните форму"
    @hide_like = true
    @feature = Feature.new
    @feature.geometry = params[:geometry]
    @feature.user = current_user
    @feature.approved = true

    respond_to do |format|
      format.html {render :layout => 'feature-popup'}
      format.json { render json: @feature }
      format.js
    end
  end

  # GET /features/1/edit
  def edit
    @title = "Редактирование точки"
    @hide_like = true
    @feature = Feature.find(params[:id])
    respond_to do |format|
      format.html {render :layout => 'feature-popup'}
      format.js
    end
  end

  # POST /features
  # POST /features.json
  def create
    if request.format == 'application/json'
      @feature = Feature.from_json(params)
    else
      @feature = Feature.new(params[:feature])
    end

    @feature.approved = true
    @feature.user = current_user

    respond_to do |format|
      if @feature.save
        @feature.toggle_like(current_user, 'like')
        format.html { redirect_to @feature, notice: 'Feature was successfully created.' }
        format.json { render json: @feature, status: :created, location: @feature }
        format.js
      else
        format.html { render action: "new" }
        format.json { render json: @feature.errors, status: :unprocessable_entity }
        format.js { render action: 'new' }
      end
    end
  end

  # PUT /features/1
  # PUT /features/1.json
  def update
    attrs = {}
    if request.format == 'application/json'
      @feature = Feature.find(params["properties"][:id])
      attrs = params["properties"]
      attrs.merge!("geometry" => params["geometry"])
    else
      @feature = Feature.find(params[:id])
      attrs = params[:feature] if params[:feature]
    end

    if params[:remove_photo]
      @feature.photo = nil
    end

    respond_to do |format|
      if !attrs["geometry"].nil? and !attrs["geometry"]["coordinates"].nil?
        coords = attrs["geometry"]["coordinates"]
        attrs['geometry'] = "POINT(#{coords[0]} #{coords[1]})"
      end
      
      if have_edit_permissions?(@feature) and @feature.update_attributes(attrs)
        format.html { redirect_to @feature, notice: 'Feature was successfully updated.' }
        format.json { head :no_content }
        format.js
      else
        format.html { render action: "edit", layout: 'feature-popup' }
        format.json { render json: @feature.errors, status: :unprocessable_entity }
        format.js { render action: 'edit' }
      end
    end
  end

  def toggle_like
    respond_to do |format|
      begin

        @feature = Feature.find(params[:id])

        @feature.toggle_like(current_user, params[:vote])

        format.json {render json: @feature.rating}
        format.js
      rescue
        format.json {render status: :unprocessable_entity}
      end
    end
  end

  def like_widget
    @feature = Feature.find(params[:id])

    respond_to do |format|
      format.html {render :partial => 'like_widget'}
    end
  end

  # DELETE /features/1
  # DELETE /features/1.json
  def destroy
    @feature = Feature.find(params[:id])
    respond_to do |format|
      if have_edit_permissions?(@feature)
        @feature.destroy

        format.html { redirect_to features_url }
        format.json { head :no_content }
        format.js
      else
        format.json { render status: :unprocessable_entity }
        format.html { redirect_to features_url, :alert => "You don't have permissions to delete feature" }
        format.js { render action: 'edit' }
      end
    end
  end

  def map
    @features = Feature.find(:all)
    @latest_comments = Comment.page(params[:comments_page]).order('posted_on DESC')
    render
  end

  private

  def sort_column
    Feature.column_names.include?(params[:sort]) ? params[:sort] : "rating"
  end

  def sort_direction
    %w[asc desc].include?(params[:direction]) ? params[:direction] : "desc"
  end

  def show_existing
    (params[:existing] == 'false') ? false : true
  end

end
