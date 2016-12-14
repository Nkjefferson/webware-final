// Add a String.format() method because Javascript is ass.
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

$(document).on('ready', function() {

    function put_professor_profile(professor_id, put_data, callback) {
        $.ajax({
            type: "PUT",
            url: '/api/professors/' + professor_id,
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

    function delete_course(course_id, callback) {
        $.ajax({
            type: "DELETE",
            url: '/api/courses/' + course_id,
            success: function() {
                callback();
            },
            error: function(e) {
                console.log(e);
            },
            dataType: 'json'
        });
    }

    function post_add_course(post_data, callback) {
        $.ajax({
            type: "POST",
            url: '/api/courses',
            data: post_data,
            success: function(data) {
                callback(data);
            },
            error: function(e) {
                console.log(e);
            },
            dataType: 'json'
        });
    }

    function build_course_html_element(name, id) {
        var elem =
            '<div class="row left">' +
            '<div class="col-md-8">' +
            '<button class="course_button btn btn-block btn-link left" course_id="{0}">{1}' +
            '</button>' +
            '</div>' +
            '<div class="col-md-4">' +
            '<button class="course_delete_button btn btn-block btn-danger" course_id="{0}">Delete' +
            '</button>' +
            '</div>' +
            '</div><br/>';
        return elem.format(id, name);
    }


    var view_profile_area = $('#view_profile');
    var edit_profile_area = $('#edit_profile');
    var edit_button = $('#edit_button');
    var edit_form = $('#edit_form');

    var courses_list = $('#courses');
    var add_course_form = $('#add_course_form');

    edit_button.on('click', function(e) {
        view_profile_area.hide('slow');
        edit_profile_area.show('slow');
    });

    edit_form.on('submit', function(e) {
        e.preventDefault();

        var put_data = {};
        $.each(edit_form.find(':input').serializeArray(), function(i, field) {
            put_data[field.name] = field.value;
        });
        put_professor_profile(put_data.id, put_data, function(professor) {
            view_profile_area.find('.profile').text(professor.profile);
            view_profile_area.find('.img_url').attr('src', professor.img_url);
            edit_profile_area.find('.profile').text(professor.profile);
            edit_profile_area.find('.img_url').text(professor.profile);
        });

        edit_profile_area.hide('slow');
        view_profile_area.show('slow');
    });

    $(document).on('click', '.course_delete_button', function(event) {
        var clicked_element = $(this);
        delete_course(clicked_element.attr('course_id'), function() {
            console.log(clicked_element.closest('.row').remove());
        });
    });

    $(document).on('click', '.course_button', function(event) {
        var clicked_element = $(this);
        window.location.assign('/courses/' + clicked_element.attr('course_id'));
    });

    add_course_form.on('submit', function(e) {
        e.preventDefault();

        var post_data = {};
        $.each(add_course_form.find(':input').serializeArray(), function(i, field) {
            post_data[field.name] = field.value;
        });

        if (post_data.name) {
            post_add_course(post_data, function(course) {
                var elem = $(build_course_html_element(course.name, course.id));
                elem.hide();
                courses_list.append(elem);
                elem.show('slow');
                add_course_form.find('input[name="name"]').val('');
            });
        }
    });
});
