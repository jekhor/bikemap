$(document).ready(function() {
  $('a[rel*="lightbox"]').lightBox();

  $('ul.tabs-nav').each(function() {
    var active, content, links = $(this).find('a');

    active = $(links.filter('[href="'+location.hash+'"]')[0] || links[0]);
    active.addClass('active');
    content = $(active.attr('href'));

    links.not(active).each(function () {
      $($(this).attr('href')).hide();
    });

    $(this).on('click', 'a', function(e){
      // Make the old tab inactive.
      active.removeClass('active');
      content.hide();

      // Update the variables with the new link and content
      active = $(this);
      content = $($(this).attr('href'));

      // Make the tab active.
      active.addClass('active');
      content.show();

      // Prevent the anchor's default click action
      e.preventDefault();
    });
  });
});
