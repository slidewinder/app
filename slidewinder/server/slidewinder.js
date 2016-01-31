var slidewinder = Meteor.npmRequire('slidewinder');

Slides = new Mongo.Collection('slides');
Decks = new Mongo.Collection('decks');
//
// var testslidedata = {
//   license: 'cc-by 4.0',
//   author: 'Richard Smith-Unna',
//   owner: 'DNyT8Xhbr5GYqzDAt',
//   private: false,
//   body: 'test test test',
//   title: 'This is the first ever slide on app.slidewinder.io',
//   'background-image': 'http://weknowmemes.com/wp-content/uploads/2012/06/drunk-baby-got-your-nose.jpg',
//   faves: [],
//   tags: []
// };
//
// var testslide = new slidewinder.slide(testslidedata);
// console.log(testslide.dump());
// Slides.insert(testslide.dump());

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
  }
});
