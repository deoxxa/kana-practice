var memory_set = new MemorySet(["r","h"], _.keys(DATA.items.h), DATA);

var current_game = null,
    current_score = 0;

function update_score() {
  $("#current-score").text("Current Score: " + current_score);
}

function new_game() {
  var target = $("#game");
  target.empty();
  var game = new Game(memory_set, 8);
  game.render(target);

  game.on("end", function() {
    new_game();
  });

  game.on("correct", function() {
    current_score++;
    update_score();
  });

  game.on("incorrect", function() {
    current_score--;
    update_score();
  });

  game.on("hint", function() {
    current_score--;
    update_score();
  });

  $("#hint").unbind("click");
  $("#hint").on("click", function() { game.hint(); });

  return game;
}

function view_stats() {
  console.log(memory_set);
}

$.domReady(function() {
  $("#new-game").on("click", new_game);
  $("#current-score").on("click", view_stats);
  current_game = new_game();
});
