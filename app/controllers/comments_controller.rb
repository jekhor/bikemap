# encoding: utf-8

class CommentsController < ApplicationController
  def index
    @comments = Comment.all
    respond_to do |format|
      format.json {render json: @comments}
      format.html
    end
  end

  def new
    @comment = Comment.new
    respond_to do |format|
      format.html
      format.js
    end
  end

  def show
    @comment = Comment.find(params[:id])
    respond_to do |format|
      format.json {render json: @comment}
    end
  end

  def create
    @comment = Comment.new(params[:comment])
    @comment.posted_on = DateTime.now;

    if @comment.save
      flash[:notice] = "Комментарий отправлен."
    else
      flash[:alert] = "Упс! С комментарием что-то не так..."
    end

    respond_to do |format|
      format.js
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
