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

Template.library.helpers({
  decks: function() {
    console.log('library.slides()');
    return Decks.find(constructQuery('decks', true));
  },
  slides: function() {
    console.log('library.slides()');
    return Slides.find(constructQuery('slides', true));
  }
});

Template.slide_card.helpers({
  image: function() {
    console.log('slide_card.image()');
    return this['background-image'];
  }
})

Template.slide_text_card.helpers({
  truncatedContent: function() {
    return this.body;
  }
})

Template.slide_image_card.helpers({
  truncatedContent: function() {
    return this.body;
  },
  image: function() {
    console.log('slide_card.image()');
    return this['background-image'];
  }
})
