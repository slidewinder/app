var slidewinder = Meteor.npmRequire('slidewinder');

Slides = new Mongo.Collection('slides');
Decks = new Mongo.Collection('decks');
Presentations = new Mongo.Collection('presentations');

Meteor.publish("slides", function (everyone) {
  var cond = [
    { owner: this.userId }
  ]
  if (everyone) {
    cond.push({ private: false });
  }
  return Slides.find({
    $or: cond
  });
});

Meteor.publish("decks", function () {
  return Decks.find({
    $or: [
      { private: false },
      { owner: this.userId }
    ]
  });
});

Meteor.methods({
  renderSlide: function(username, slidedata) {
    var s = new slidewinder.slide(slidedata);
    var d = new slidewinder.deck(null, {
      author: username,
      title: 'slide preview',
      tags: []
    }, 'remark');
    html = ''
    d.preprocess.call(d, [s], function() {
      d.render.call(d, function(){
        html = d.renderedDeck;
      });
    });
    return html;
  },
  saveSlide: function(slidedata) {
    var s = new slidewinder.slide(slidedata);
    Slides.update({ _id: s._id }, s, { upsert: true });
  },
  saveDeck: function(deckdata) {
    Decks.insert(deckdata);
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
