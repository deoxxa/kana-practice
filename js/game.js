var _ = require("underscore");

function Game(memory_set, num) {
  var self = this;

  this.events = {};

  this.memory_set = memory_set;

  this.last_clicked = null;

  this.items = this.memory_set.get_items(num);
  this.todo = _.size(this.items);

  this.panels = _(this.items).chain().reduce(function(memo, item) {
    return memo.concat(_.map(item.items, function(value) {
      var panel = document.createElement("span");

      panel.className = "panel";

      panel.appendChild(document.createTextNode(value));

      panel.item = item;
      panel.done = false;

      $(panel).on("click", function() {
        if (panel.done) { return; }

        if (!self.last_clicked) {
          self.last_clicked = panel;
          $(panel).css({"border-color": "#AAAA88", "background-color": "#FFFFAA"});
        } else {
          if (panel.item.id == self.last_clicked.item.id) {
            panel.item.hits++;
            self.todo--;

            _.each([panel, self.last_clicked], function(el) {
              $(el).css({"background-color": "#CCFFCC", "border-color": "#88AA88"});
            });

            panel.done = true;
            self.last_clicked.done = true;

            self.emit("correct", panel.item);
          } else {
            self.last_clicked.item.misses++;
            panel.item.misses++;

            _.each([panel, self.last_clicked], function(el) {
              if (el.current_animation) { el.current_animation.stop(true); }
              $(el).css({"border-color": "#CC8888", "background-color": "#FFCCCC"});
              el.current_animation = $(el).animate({"background-color": "#FFFFFF", "border-color": "#808080"});
            });

            self.emit("incorrect", [self.last_clicked.item, panel.item]);
          }

          if (self.todo == 0) {
            self.emit("end");
          }

          self.last_clicked = null;
        }
      });

      return panel;
    }));
  }, []).shuffle().value();
}

Game.prototype.hint = function() {
  var self = this;

  var a = _.filter(this.panels, function(panel) {
    return !panel.done && (!self.last_clicked || panel == self.last_clicked);
  }).shift();

  var b = _.filter(this.panels, function(panel) {
    return panel.item.id == a.item.id;
  });

  _.each([a,b], function(el) {
    if (el.current_animation) { el.current_animation.stop(true); }
    $(el).css({"border-color": "#8888CC", "background-color": "#CCCCFF"});
    el.current_animation = $(el).animate({"background-color": "#FFFFFF", "border-color": "#808080"});
  });

  this.last_clicked = null;

  this.emit("hint", [a,b]);
};

Game.prototype.render = function(parent) {
  _.each(this.panels, function(panel) {
    parent.append(panel);
  });

  this.emit("begin");
};

Game.prototype.on = function(ev, fn) {
  if (!this.events[ev]) { this.events[ev] = []; }
  this.events[ev].push(fn);
  return this;
};

Game.prototype.emit = function() {
  var args = _.toArray(arguments);
  var ev = args.shift();

  if (!ev || !this.events[ev]) { return this; }

  this.events[ev].forEach(function(fn) {
    fn.apply(undefined, arguments);
  });

  return this;
};
