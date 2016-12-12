// add scripts

$(document).on('ready', function() {
  var edit_button = $('#edit_button');
  var edit_section = $('#edit_section');
  var view_section = $('#view_section');

  edit_button.on('click', function(e) {
    view_section.hide();
    edit_section.fadeIn('slow');
  });
});
