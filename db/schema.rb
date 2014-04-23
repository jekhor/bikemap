# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20140423160228) do

  create_table "comments", :force => true do |t|
    t.text     "text",      :null => false
    t.datetime "posted_on", :null => false
    t.integer  "user_id",   :null => false
  end

  create_table "features", :force => true do |t|
    t.spatial  "geometry",           :limit => {:srid=>4326, :type=>"geometry", :geographic=>true}
    t.string   "name"
    t.datetime "created_at",                                                                                           :null => false
    t.datetime "updated_at",                                                                                           :null => false
    t.integer  "rating",                                                                            :default => 0
    t.string   "description"
    t.integer  "capacity"
    t.text     "comment"
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
    t.datetime "photo_updated_at"
    t.boolean  "existing",                                                                          :default => false
    t.boolean  "approved",                                                                          :default => false
    t.integer  "user_id"
    t.string   "address"
    t.integer  "realm_id"
  end

  create_table "features_users_likes", :id => false, :force => true do |t|
    t.integer "feature_id"
    t.integer "user_id"
  end

  create_table "realms", :force => true do |t|
    t.string  "name"
    t.string  "base_url"
    t.float   "map_center_lat"
    t.float   "map_center_lon"
    t.integer "map_zoom"
  end

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "",    :null => false
    t.string   "encrypted_password",     :default => "",    :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                                :null => false
    t.datetime "updated_at",                                :null => false
    t.string   "provider"
    t.string   "uid"
    t.string   "name"
    t.boolean  "admin",                  :default => false
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

end
