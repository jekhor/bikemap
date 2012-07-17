class CommentsController < ApplicationController
  def index
    @feature = Feature.find(params[:feature_id])

    respond_to do |format|
      format.json {render json: @feature.comments}
      format.html
    end
  end

  def show
    @feature = Feature.find(params[:feature_id])
    @comment = @feature.comments.find(params[:id])
    respond_to do |format|
      format.json {render json: @comment}
    end
  end

  def create
    @feature = Feature.find(params[:feature_id])
    @comment = @feature.comments.new(params[:comment])
    @comment.posted_on = DateTime.now;

    respond_to do |format|
      if @comment.save
        format.json { render json: @comment, status: :created, location: feature_comment_url(:id => @comment.id) }
      else
        format.json { render json: @comment.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @comment = Comment.find(params[:id])

    respond_to do |format|
      if @comment.update_attributes(params[:comment])
        format.json { head :no_content }
      else
        format.json { render json: @comment.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @comment = Comment.find(params[:id])
    @comment.destroy

    respond_to do |format|
      format.json { head :no_content }
    end
  end
end
