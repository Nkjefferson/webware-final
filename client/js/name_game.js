$(document).on('ready',function(){
  var begin_button = $('#begin');
  var title = $('#title');

  var initial = $('#initial');
  var in_game = $('#in_game');

  var current_guess_image = $('#in_game img');
  var current_guess_name = $('#in_game p.name');

  var choice1 = $('#choice1');
  var choice2 = $('#choice2');
  var choice3 = $('#choice3');
  var choice4 = $('#choice4');

  var students = [];
  var correct;

  var correct_guesses = 0;
  var guesses = 0;

  function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a;
  }

  function set_guess(src, name) {
    current_guess_image.attr('src', src);
    current_guess_name.text(name);
  }

  function choose_four() {
    var shuffled = shuffle(students);
    return [shuffled[0], shuffled[1], shuffled[2], shuffled[3]];
  }

  function set_four(four) {
    var correct_student = four[0];
    set_guess(correct_student.img_url, '');
    correct = correct_student.name;

    var shuffle_again = shuffle(four);
    choice1.text(shuffle_again[0].name);
    choice2.text(shuffle_again[1].name);
    choice3.text(shuffle_again[2].name);
    choice4.text(shuffle_again[3].name);
  }

  function start_game() {
    var random_four = choose_four();
    set_four(random_four);
  }

  $('.choice').on('click', function(e) {

    guesses += 1;
    if ($(this).text() === correct) {
      correct_guesses += 1;
    }

    $('#guesses').text(guesses);
    $('#correct_guesses').text(correct_guesses);

    mark_buttons_correct();
    current_guess_name.text(correct);
  });


  function mark_buttons_correct() {
    choice1.removeClass('btn-default');
    if (choice1.text() === correct) {
      choice1.addClass('btn-success');
    } else {
      choice1.addClass('btn-danger');
    }
    choice1.attr('disabled', true);

    choice2.removeClass('btn-default');
    if (choice2.text() === correct) {
      choice2.addClass('btn-success');
    } else {
      choice2.addClass('btn-danger');
    }
    choice2.attr('disabled', true);

    choice3.removeClass('btn-default');
    if (choice3.text() === correct) {
      choice3.addClass('btn-success');
    } else {
      choice3.addClass('btn-danger');
    }
    choice3.attr('disabled', true);

    choice4.removeClass('btn-default');
    if (choice4.text() === correct) {
      choice4.addClass('btn-success');
    } else {
      choice4.addClass('btn-danger');
    }
    choice4.attr('disabled', true);

    $('#next_button_row').show();
  }

  $('#next').on('click', function(e) {
    choice1.removeClass('btn-success');
    choice1.removeClass('btn-danger');
    choice1.addClass('btn-default');
    choice1.attr('disabled', false);

    choice2.removeClass('btn-success');
    choice2.removeClass('btn-danger');
    choice2.addClass('btn-default');
    choice2.attr('disabled', false);

    choice3.removeClass('btn-success');
    choice3.removeClass('btn-danger');
    choice3.addClass('btn-default');
    choice3.attr('disabled', false);

    choice4.removeClass('btn-success');
    choice4.removeClass('btn-danger');
    choice4.addClass('btn-default');
    choice4.attr('disabled', false);

    $('#next_button_row').hide();

    start_game();
  });

  begin_button.on('click', function(e) {
    initial.hide();
    begin_button.hide();
    title.hide();

    $('.item').each(function(i, item){
      var to_push = {
        name: $(item).find('.name').text(),
        img_url: $(item).find('img').attr('src')
      };
      students.push(to_push);
    });

    start_game();

    in_game.show();
  });
});