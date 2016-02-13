Session.set('library', {
  filters: {
    decks: {
      everyone: true,
      query: {}
    },
    slides: {
      everyone: true,
      query: {}
    }
  }
});

Deps.autorun(function(){
  document.title = Session.get("pagetitle");
});

Session.set('pagetitle', 'slidewinder')

Slides = new Mongo.Collection('slides');
Decks = new Mongo.Collection('decks');

Tracker.autorun(function () {
  SlidesSub = Meteor.subscribe("slides", Session.get('slides.show-everyone'));
  DecksSub = Meteor.subscribe("decks", Session.get('decks.show-everyone'));
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
