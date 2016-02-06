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
  return opts;
}

Template.create_deck.helpers({
  slides: function() {
    return Slides.find(constructQuery('slides', true));
  }
});

function makeDrake () {
  if (window.dragula) {
    var options = {
      copy: true,
      copySortSource: true,
      accepts: function (el, target, source, sibling) {
        return $(target).is('#slide-receiver');
      }
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

Template.create_deck.onRendered(function () {
  insignia($('#deck-tags')[0], {
    delimiter: ',',
    deletion: true
  });
  makeDrake();
});

var getDeckData = function() {
  var slides = $('#slide-receiver')
    .children()
    .map(function(){ return this.id; })
    .get();
  var metadata = {};
  var fields = $(".deck-metadata").serializeArray();
  for (x in fields) {
    metadata[fields[x].name] = fields[x].value;
  }
  metadata.owner = Meteor.userId();
  metadata.license = 'cc-by 4.0';
  metadata.slides = slides;
  return metadata;
}

var presentDeck = function(err, _id) {
  if (err) {
    Materialize.toast("Deck rendering failed :(", 4000, 'flash-err');
    console.log(err);
  } else {
    window.open(Meteor.absoluteUrl('/presentation/' + _id), '_blank');
  }
}

Template.create_deck.events({
  'click #save_deck_btn': function(e) {
    var deckdata = getDeckData();
    if (deckdata.slides.length == 0) {
      Materialize.toast("Oops, you tried to create an empty deck", 4000, 'flash-err');
      return
    }
    if (!(deckdata.title) || deckdata.title.trim().length == 0) {
      Materialize.toast("Oops, you left the title blank", 4000, 'flash-err');
      return
    }
    Meteor.call('saveDeck', deckdata);
    FlowRouter.go('/library');
  }
});

Template.deck_card.helpers({
  size: function() {
    return this.slides.length;
  }
});

Template.deck_card.events({
  'mouseenter .deck-card': function(e) {
    $(e.target).find('.deck-card-btn-bar').addClass('active');
  },
  'mouseleave .deck-card': function(e) {
    $(e.target).find('.deck-card-btn-bar').removeClass('active');
  },
  'click .deck-present': function(e) {
    Meteor.call('renderDeck', this, presentDeck);
  },
  'click .deck-edit': function(e) {
    FlowRouter.go('/decks/edit', this);
  }
});
