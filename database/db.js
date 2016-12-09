var pg = require('pg');
var connection_string = (process.env.DATABASE_URL || 'postgres://localhost:5432/webware');

/*
Create a student in the database if one did not exist.

Then load their details, and respond to the request.
 */
function login_or_register_student (req, res) {
    var student_name = req.session.name;
    var qs = "INSERT INTO student(name) SELECT ($1) WHERE NOT EXISTS " +
        "(SELECT name FROM student WHERE name=$1);";
    var data = [student_name];

    pg.connect(connection_string, function (err, client, done) {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // Insert the new student.
        var query = client.query(qs, data);

        // Query came back.
        query.on('end', function() {
            done();

            // Load details and respond to the request.
            get_student_attrs(req, res);
        });
    });
};
exports.login_or_register_student = login_or_register_student;


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
            var profile = results[0].profile;
            var img_url = results[0].img_url;

            // Save login info to session.
            req.session.id = id;
            req.session.profile = profile;
            req.session.img_url = img_url;

            return res.render('student', {
                logged_in: true,
                name: results[0].name,
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

function get_student_courses(req, res) {
    var student_id = req.session.id;
    var qs = "SELECT row_to_json(r) FROM " +
        "(SELECT course_id FROM registration WHERE student_id=$1) r";
    var data = [student_id];

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
            var id = obj.f1;
            results.push(id);
        });

        // Finally respond to request.
        query.on('end', function() {
            done();

            // Save login info to session.
            req.session.course_ids = results;

            return res.render('student_courses', {
                logged_in: true,
                courses: results
            });
        })
    });
}
exports.get_student_courses = get_student_courses;
