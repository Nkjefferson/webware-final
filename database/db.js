var pg = require('pg');
var connection_string = (process.env.DATABASE_URL || 'postgres://localhost:5432/webware');

GLOBAL.db_content = {
    students: [],
    professors: [],
    courses: [],
    registrations: []
};

function refresh_db_content(callback) {
    student_results = [];
    professor_results = [];
    course_results = [];
    registration_results = [];

    student_done = false;
    professor_done = false;
    course_done = false;
    registration_done = false;

    var exit_when_done = function () {
        if (student_done && professor_done && course_done && registration_done) {
            GLOBAL.db_content.students = student_results;
            GLOBAL.db_content.professors = professor_results;
            GLOBAL.db_content.courses = course_results;
            GLOBAL.db_content.registrations = registration_results;

            callback();
            return true;
        }

        return false;
    };

    pg.connect(connection_string, function (error, client, done) {
        if (error) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // Collect all student data.
        var student_query = client.query("SELECT * FROM student;");
        student_query.on('row', function(row) {
            student_results.push(row);
        });
        student_query.on('end', function() {
            student_done = true;
            if (exit_when_done()) { done(); }
        });

        // Collect all professor data.
        var professor_query = client.query("SELECT * FROM professor;");
        professor_query.on('row', function(row) {
            professor_results.push(row);
        });
        professor_query.on('end', function() {
            professor_done = true;
            if (exit_when_done()) { done(); }
        });

        // Collect all course data.
        var course_query = client.query("SELECT * FROM course;");
        course_query.on('row', function(row) {
            course_results.push(row);
        });
        course_query.on('end', function() {
            course_done = true;
            if (exit_when_done()) { done(); }
        });

        // Collect all registration data.
        var registration_query = client.query("SELECT * FROM registration;");
        registration_query.on('row', function(row) {
            registration_results.push(row);
        });
        registration_query.on('end', function() {
            registration_done = true;
            if (exit_when_done()) { done(); }
        });
    });
}
exports.refresh_db_content = refresh_db_content;

/*
Create a student in the database if one did not exist.

Then load their details, and respond to the request.
 */
function login_or_register_student (req, callback) {
    var student_name = req.session.name;
    var existing_students = GLOBAL.db_content.students;
    var found_student = false;

    for (var i = 0; i < existing_students.length; i++) {
        if (existing_students[i].name === student_name) {
            found_student = existing_students[i];
        }
    }

    if (found_student) {
        req.session.id = found_student.id;
        req.session.name = found_student.name;
        req.session.profile = found_student.profile;
        req.session.img_url = found_student.img_url;

        callback();
    } else {
        pg.connect(connection_string, function (err, client, done) {
            // Handle connection errors
            if(err) {
                done(); console.log(err); return res.status(500).json({success: false, data: err});
            }

            var qs = "INSERT INTO student(name) SELECT ($1) WHERE NOT EXISTS " +
                     "(SELECT name FROM student WHERE name=$1);";

            // Insert the new student.
            var query = client.query(qs, [student_name]);

            // Query came back.
            query.on('end', function() {
                done();
                var cb = function() {
                    login_or_register_student(req, callback);
                };
                refresh_db_content(cb);
            });
        });
    }
}
exports.login_or_register_student = login_or_register_student;

function professor_by_id(id) {
    for (var i = 0; i < GLOBAL.db_content.professors.length; i++) {
        var professor = GLOBAL.db_content.professors[i];
        if (professor.id == id) {
            return professor;
        }
    }

    return null;
}

function get_student_courses(req) {
    var student_id = req.session.id;

    var course_ids = [];
    for (var i = 0; i < GLOBAL.db_content.registrations.length; i++) {
        var registration = GLOBAL.db_content.registrations[i];
        if (registration.student_id == student_id) {
            course_ids.push(registration.course_id);
        }
    }

    var courses = [];
    for (var i = 0; i < GLOBAL.db_content.courses.length; i++) {
        var course = GLOBAL.db_content.courses[i];
        if (course_ids.indexOf(course.id) > -1) {
            courses.push(course);
        }
    }

    for (var i = 0; i < courses.length; i++) {
        var professor_name = professor_by_id(courses[i].professor_id).name;
        courses[i].professor_name = professor_name;
    }

    req.session.courses = courses;
}
exports.get_student_courses = get_student_courses;

////////////////////////
// UNDER HERE NOT USING LOCAL DB THING
////////////////////////

/*
Query database for student details.

Then respond to the request.
 */
function get_student_attrs(req, res) {
    var student_name = req.session.name;
    var qs = "SELECT row_to_json(r) FROM " +
        "(SELECT (id, name, profile, img_url) FROM student WHERE name=$1) r";
    var data = [student_name];

    // Collect query results as they come in.
    var results = [];

    // Make the query.
    pg.connect(connection_string, function (err, client, done) {
        // Handle connection errors.
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // Insert the new student.
        var query = client.query(qs, data);

        // Push each new row to results.
        query.on('row', function(row) {
            var obj = row.row_to_json.row;
            results.push({
                id: obj.f1,
                name: obj.f2,
                profile: obj.f3,
                img_url: obj.f4
            });
            results.push(obj);
        });

        // Finally respond to request.
        query.on('end', function() {
            done();

            var id = results[0].id;
            var name = results[0].name;
            var profile = results[0].profile;
            var img_url = results[0].img_url;

            // Save login info to session.
            req.session.id = id;
            req.session.name = name;
            req.session.profile = profile;
            req.session.img_url = img_url;

            return res.render('student', {
                logged_in: true,
                name: name,
                profile: profile ? profile.replace(/(\r)?\n/g, '<br />') : '',
                img_url: img_url
            });
        })
    });
}
exports.get_student_attrs = get_student_attrs;

/*
Update details about a student in the database.
 */
function update_student(profile, img_url, req, res) {
    var qs = "UPDATE student SET profile=$1, img_url=$2 WHERE name=$3";
    var data = [profile, img_url, req.session.name];

    pg.connect(connection_string, function (err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // Insert the new student.
        var query = client.query(qs, data);

        query.on('end', function() {
            done();

            // Go back to student home page.
            res.redirect('/student');
        });
    });
}
exports.update_student = update_student;

