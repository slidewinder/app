
Decks = new Mongo.Collection('decks');
Presentations = new Mongo.Collection('presentations');

Meteor.publish("decks", function (everyone) {
  var cond = [
    { owner: this.userId }
  ]
  if (everyone) {
    cond.push({ private: false });
  }
  return Decks.find({
    $or: cond
  });
});

// Deny all client-side updates on all collections
Decks.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
Presentations.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Meteor.methods({
  saveDeck: function(deckdata) {
    Decks.update({ _id: deckdata._id }, deckdata, { upsert: true });
  },
  renderDeck: function(deckdata) {
    var query = deckdata.slides.map(function(s) { return { _id: s }; });
    var slides = Slides.find({ $or: query }).fetch().map(function(s) {
      if (s.bg_img) {
        var url = s.bg_img;
        s['backround-image'] = url;
        delete s.bg_img;
      }
      if (s['background-image']) {
        var url = s['background-image'];
        if (url && !(/^url\(/.test(url))) {
          url = 'url(' + url + ')';
        }
        s['background-image'] = url;
      }
      return new slidewinder.slide(s);
    });
    var d = new slidewinder.deck(null, deckdata);
    d.preprocess(slides, function(){});
    d.render(function(){});
    var sha = CryptoJS.SHA1(d.renderedDeck).toString();
    if (Presentations.find(sha).count() == 0) {
      Presentations.insert({ _id: sha, html: d.renderedDeck });
    }
    return sha;
  }
});

SlideIndex = new EasySearch.Index({
  collection: Slides,
  fields: ['author', 'license', 'description', 'body', 'title', 'tags'],
  engine: new EasySearch.MongoTextIndex()
});

DeckIndex = new EasySearch.Index({
  collection: Decks,
  fields: ['author', 'license', 'description', 'title', 'tags'],
  engine: new EasySearch.MongoTextIndex()
});
