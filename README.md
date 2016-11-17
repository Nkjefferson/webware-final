I have already set up a database for this app to access. Haven't created the
right tables, or anything like that.

Here's the plan. We have a database storing three models:
    Student(id, name, profile_text, img_url)
    Professor(id, name, profile_text, img_url)
    Course(id, name, professor_id)
    StudentCourseMap(student_id, course_id)

To login, you simply type your WPI username and indicate whether you're a
student or a professor. No authentication, it's a simple project.

Students can specify a profile picture, update their profile text, and add
whatever classes their taking.

Professors can add classes their teaching, and then for each class they can view
what students are in it, and see the student profiles/images.

If we have time as a bonus: Prof can pick a class and play flashcard name game
for the students in that class.

