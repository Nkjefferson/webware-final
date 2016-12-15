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

function build_registered_course_html_element(name, id) {
    var elem =
        '<div class="row left">' +
        '<div class="col-md-8">' +
        '<button class="course_button btn btn-block btn-link left" course_id="{0}">' +
        '{1}' +
        '</button>' +
        '</div>' +
        '<div class="col-md-4">' +
        '<button class="course_drop_button btn btn-sm btn-block btn-danger" course_id="{0}">' +
        'Drop' +
        '</button>' +
        '</div>' +
        '</div>';
    return elem.format(id, name)
}

function build_course_html_element(name, id) {
    var elem =
        '<div class="row left">' +
        '<div class="col-md-8">' +
        '<button class="course_button btn btn-block btn-link left" course_id="{0}">{1}' +
        '</button>' +
        '</div>' +
        '<div class="col-md-4">' +
        '<button class="course_register_button btn btn-sm btn-block btn-success" course_id="{0}">Register' +
        '</button>' +
        '</div>' +
        '</div>';
    return elem.format(id, name);
}

function populate_all_courses(courses) {
    var all_courses_div = $("#all_courses");
    all_courses_div.empty();
    var student_id = $('#student_id').attr('student_id');

    $.each(courses, function(i, field) {
        var course = courses[i];
        var course_students = course.Students;

        var will_add = true;
        for (var i = 0; i < course_students.length; i++) {
            var maybe_id = course_students[i].id;
            if (maybe_id == student_id) {
                will_add = false;
            }
        }

        if (will_add) {
            var elem = build_course_html_element(course.name, course.id);
            all_courses_div.append($(elem));
        }
    });
}

function repopulate_all_courses() {
    $.ajax({
        type: "GET",
        url: '/api/courses/',
        success: populate_all_courses,
        error: function (e) {
            console.log(e);
        },
        dataType: 'json'
    });
}

repopulate_all_courses();

$(document).on('ready', function() {

    function put_student_profile(student_id, put_data, callback) {
        $.ajax({
            type: "PUT",
            url: '/api/students/' + student_id,
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

    function drop_course(delete_data, callback) {
        // delete_data needs student_id and course_id
        $.ajax({
            type: "DELETE",
            url: '/api/registrations/',
            data: delete_data,
            success: function(data) {
                callback(data);
            },
            error: function(e) {
                console.log(e);
            },
            dataType: 'json'
        });
    }

    function register_course(post_data, callback) {
        $.ajax({
            type: 'POST',
            url: '/api/registrations',
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

    // function build_course_html_element(name, id) {
    //     var elem =
    //         '<div class="row left">' +
    //         '<div class="col-md-8">' +
    //         '<button class="course_button btn btn-block btn-link left" course_id="{0}">{1}' +
    //         '</button>' +
    //         '</div>' +
    //         '<div class="col-md-4">' +
    //         '<button class="course_delete_button btn btn-block btn-danger" course_id="{0}">Delete' +
    //         '</button>' +
    //         '</div>' +
    //         '</div><br/>';
    //     return elem.format(id, name);
    // }


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
        put_student_profile(put_data.id, put_data, function(student) {
            view_profile_area.find('.profile').text(student.profile);
            view_profile_area.find('.img_url').attr('src', student.img_url);
            edit_profile_area.find('.profile').text(student.profile);
            edit_profile_area.find('.img_url').text(student.profile);
        });

        edit_profile_area.hide('slow');
        view_profile_area.show('slow');
    });

    $(document).on('click', '.course_drop_button', function(event) {
        var clicked_element = $(this);
        var course_id = clicked_element.attr('course_id');
        var student_id = $('#student_id').attr('student_id');
        var delete_data = {
            course_id: course_id,
            student_id: student_id
        };
        drop_course(delete_data, function(data) {
            clicked_element.closest('.row').remove();
            var course_name = data.name;
            $('#all_courses').append($(build_course_html_element(course_name, course_id)));
        });
    });

    $(document).on('click', '.course_register_button', function(event) {
        var clicked_element = $(this);
        var course_id = clicked_element.attr('course_id');
        var student_id = $('#student_id').attr('student_id');
        var post_data = {
            course_id: course_id,
            student_id: student_id
        }
        register_course(post_data, function(data) {
            clicked_element.closest('.row').remove();
            $('#courses').append(build_registered_course_html_element(data.name, data.id));
        });
    }) ;

    $(document).on('click', '.course_button', function(event) {
        var clicked_element = $(this);
        window.location.assign('/courses/' + clicked_element.attr('course_id'));
    });
});
