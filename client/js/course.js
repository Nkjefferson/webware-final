$(document).on('ready',function(){
	var edit_form = $('#edit_form');
	var edit_course = $('#edit_course');
	var edit_button = $('#edit_button');

	function put_course(course_id, put_data, callback) {
        $.ajax({
            type: "PUT",
            url: '/api/courses/' + course_id,
            data: put_data,
            success: function(data) {
                callback(data);
            },
            error: function(e) {
                console.log(e);
            },
            dataType: 'json'
        });
    }

	 edit_button.on('click', function(e) {
	        edit_button.hide('slow');
	        edit_course.show('slow');
	 });

	edit_form.on('submit', function(e) {
        e.preventDefault();

        var put_data = {};
        $.each(edit_form.find(':input').serializeArray(), function(i, field) {
            put_data[field.name] = field.value;
        });
        console.log(put_data);
        put_course(put_data.id, put_data, function(course) {
   			$('#view_course_name').text(course.name);
   			edit_form.find('.name').text(course.name);
        });

        edit_button.show('slow');
        edit_course.hide('slow');
    });
})