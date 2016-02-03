dragula = false

var constructQuery = function(collection, onlyown) {
  opts = { $and: [] }
  if (onlyown) {
    opts.$and.push({ owner: Meteor.userId() });
  }
  query = Session.get("library").filters[collection].query;
  if (Object.keys(query).length > 0) {
    opts.$and.push(query);
  }
  console.log('constructQuery', opts);
  return opts;
}

Template.create_deck.helpers({
  slides: function() {
    console.log('decks.slides()');
    return Slides.find(constructQuery('slides', true));
  }
});

Template.create_deck.onRendered(function () {
  function makeDrake () {
    if (window.dragula) {
      var options = {
        copy: true,
        copySortSource: true
        // direction: 'horiontal'
      };
      var containers = [$('#slide-source')[0], $('#slide-receiver')[0]];
      var drake = window.dragula(containers, options);
      drake.on('drop', function(el, target, source, sibling) {
        $(target).children().each(function(index) {
            $(this).find('.slide-no').html('<h1>' + (index + 1) + '</h1>');
        });
      });
    } else {
      setTimeout(function () {
        makeDrake();
      }, 250);
    }
  }
  makeDrake();
});
