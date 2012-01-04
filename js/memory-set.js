var _ = require("underscore");

function MemorySet(types, items, data) {
  this.types = types;
  this.items = _.map(items, function(id) { return {id: id, items: _.map(types, function(type) { return data.items[type][id] || id; }), hits: 0, misses: 0}; });
}

MemorySet.prototype.get_items = function(n) {
  return this.items.sort(function(a,b) { return (b.misses - a.misses) + (Math.random() - 0.5); }).slice(0, Math.min(this.items.length, n));
};
