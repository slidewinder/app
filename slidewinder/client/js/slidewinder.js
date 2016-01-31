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
