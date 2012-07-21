class FeaturesController < ApplicationController
  # GET /features
  # GET /features.json
  def index
    @features = Feature.all

    respond_to do |format|
      format.html # index.html.erb
      format.json {
        feature_collection = {:type => 'FeatureCollection', :features => @features}
        render json: feature_collection
      }
    end
  end

  # GET /features/1
  # GET /features/1.json
  def show
    @feature = Feature.find(params[:id])

    respond_to do |format|
      format.html {render :layout => 'feature-popup'}
      format.json { render json: @feature }
    end
  end

  # GET /features/new
  # GET /features/new.json
  def new
    @feature = Feature.new
    @feature.geometry = params[:geometry]

    respond_to do |format|
      format.html {render :layout => 'feature-popup'}
      format.json { render json: @feature }
    end
  end

  # GET /features/1/edit
  def edit
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

    respond_to do |format|
      if @feature.save
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

    respond_to do |format|
      logger.debug "attrs:" + attrs.inspect
      if !attrs["geometry"].nil? and !attrs["geometry"]["coordinates"].nil?
        coords = attrs["geometry"]["coordinates"]
        attrs['geometry'] = "POINT(#{coords[0]} #{coords[1]})"
      end
      
      if @feature.update_attributes(attrs)
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

  def update_rating
    respond_to do |format|
      begin
      if params[:vote].to_i < 0
        Feature.decrement_counter :rating, params[:id]
      else
        Feature.increment_counter :rating, params[:id]
      end

      feature = Feature.find(params[:id])

      format.json {render json: feature.rating}
      rescue
        format.json {render status: :unprocessable_entity}
      end
    end
  end

  # DELETE /features/1
  # DELETE /features/1.json
  def destroy
    @feature = Feature.find(params[:id])
    @feature.destroy

    respond_to do |format|
      format.html { redirect_to features_url }
      format.json { head :no_content }
    end
  end

  def map
    @top_features = Feature.all(:order => 'rating DESC', :limit => 20)
    @latest_comments = Comment.find(:all, :order => 'posted_on DESC', :limit => 10)
    render :layout => "feature-map"
  end

end
