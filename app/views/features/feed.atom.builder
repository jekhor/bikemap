atom_feed :language => 'ru-RU' do |feed|
  feed.title @title
  feed.updated @updated

  @features.each do |item|
    next if item.updated_at.blank?

    feed.entry(item, :url => map_url + "?feature=#{item.id}") do |entry|
      entry.url  map_url + "?feature=#{item.id}"
      entry.title item.description
      content = "<p><strong>Тип:</strong> #{item.existing ? "Существующая" : "Желаемая"}</p>"
      content += "<p><strong>Адрес:</strong> #{item.description}</p>"
      content += "<p><strong>Ёмкость:</strong> #{item.capacity}</p>"
      content += "<p><strong>Комментарий:</strong> #{item.comment}</p>"
      entry.content content, :type => 'html'

      # the strftime is needed to work with Google Reader.
      entry.updated(item.updated_at.strftime("%Y-%m-%dT%H:%M:%SZ")) 

      entry.author do |author|
        author.name 'Admin'
      end
    end
  end
end
