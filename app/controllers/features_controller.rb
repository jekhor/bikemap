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
      format.html # show.html.erb
      format.json { render json: @feature }
    end
  end

  # GET /features/new
  # GET /features/new.json
  def new
    @feature = Feature.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @feature }
    end
  end

  # GET /features/1/edit
  def edit
    @feature = Feature.find(params[:id])
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
      else
        format.html { render action: "new" }
        format.json { render json: @feature.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /features/1
  # PUT /features/1.json
  def update
    if request.format == 'application/json'
      @feature = Feature.find(params["properties"][:id])
      attrs = params["properties"]
      attrs.merge!("geometry" => params["geometry"])
    else
      @feature = Feature.find(params[:id])
      attrs = params[:feature]
    end
    logger.debug attrs.inspect

    respond_to do |format|
      coords = attrs["geometry"]["coordinates"]
      @feature.geometry = "POINT(#{coords[0]} #{coords[1]})"
      @feature.name = attrs["name"]

      if @feature.save
        format.html { redirect_to @feature, notice: 'Feature was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @feature.errors, status: :unprocessable_entity }
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
    @features = Feature.all(:include => :comments).sort_by {|f| -f.comments.size}
    @latest_comments = Comment.find(:all, :order => 'posted_on DESC', :limit => 10)
    render :layout => "feature-map"
  end
end
