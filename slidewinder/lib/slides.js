Slides = new Mongo.Collection('slides');

slidewinder = {};

if (Meteor.isServer) {
  slidewinder = Meteor.npmRequire('slidewinder');
} else {
  slidewinder = {
    slide: function(a) {
      return {};
    }
  }
}

// Deny all client-side updates on all collections
Slides.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

// Define a namespace for Methods related to the Slides collection
// Allows overriding for tests by replacing the implementation (2)
Slides.methods = {};

// Render a slide as a preview. Given a username and a slide data object,
// create a full slide and use it to populate a dummy deck. Finally,
// render the dummy deck and pass the rendered HTML back to the client.
Slides.methods.renderSlide = {
  name: 'Slides.methods.renderSlide',

  validate(args) {
    return true;
  },

  run({ username, slidedata }) {
    if (Meteor.isServer) {
      // create a full slide object from the slide data
      var s = new slidewinder.slide(slidedata);
      // and a dummy deck to render it in
      var d = new slidewinder.deck(null, {
        author: username,
        title: 'slide preview',
        tags: []
      }, 'remark');

      // store the rendered deck HTML
      html = ''
      d.preprocess.call(d, [s], function() {
        d.render.call(d, function(){
          html = d.renderedDeck;
        });
      });

      // pass it back to the client
      return html;
    }
  },

  // this is part of the Meteor Methods advanced boilerplate
  // see http://guide.meteor.com/methods.html#advanced-boilerplate
  call(args, callback) {
    const options = {
      returnStubValue: true,
      throwStubExceptions: true
    }

    Meteor.apply(this.name, [args], options, callback);
  }
};

// Save a slide that has either been newly created or edited. If this is
// an edit, we only proceed if the user is the owner of the slide.
Slides.methods.saveSlide = {
  name: 'Slides.methods.saveSlide',

  validate(args) {
    return true;
  },

  run({ slidedata }) {
    if (Meteor.isServer) {

      // create a full slide object from the data
      // this takes care of basic housekeeping like ensuring the slide
      // has an ID
      var s = new slidewinder.slide(slidedata);

      // because some slides are public, we need to make sure that if this
      // is an edit operation, the user trying to edit is the owner.
      var res = Slides.find(s._id);
      if (res.count() > 0) {
        var isOwner = res.fetch()[0].owner == this.userId;
        if (!isOwner) {
          throw new Meteor.Error(
            'Slides.methods.saveSlide.unauthorized',
            "Cannot edit slides that don't belong to you"
          );
        }
      }

      // update the Slides collection with this slide. We use the
      // upsert operation to handle both edits and insertions in a single
      // command.
      Slides.update({ _id: s._id }, s, { upsert: true });

    }

    return slidedata.owner === this.userId;
  },

  // this is part of the Meteor Methods advanced boilerplate
  // see http://guide.meteor.com/methods.html#advanced-boilerplate
  call(args, callback) {
    const options = {
      returnStubValue: true,
      throwStubExceptions: true
    }

    Meteor.apply(this.name, [args], options, callback);
  }
};

// Remove a slide, only if it belongs to this user
Slides.methods.removeSlide = {
  name: 'Slides.methods.removeSlide',

  validate(args) {
    new SimpleSchema({
      slideId: { type: String }
    }).validate(args)
  },

  run({ slideId }) {

    Slides.remove({ _id: slideId, owner: this.userId });

  },

  // this is part of the Meteor Methods advanced boilerplate
  // see http://guide.meteor.com/methods.html#advanced-boilerplate
  call(args, callback) {
    const options = {
      returnStubValue: true,
      throwStubExceptions: true
    }

    Meteor.apply(this.name, [args], options, callback);
  }
};

// Toggle whether a given slide is favourited by this user
Slides.methods.toggleFave = {
  name: 'Slides.methods.toggleFave',

  validate(args) {
    new SimpleSchema({
      slideId: { type: String }
    }).validate(args)
  },

  run({ slideId }) {

    var slide = Slides.findOne(slideId);
    var update = {};
    if (!(_.isArray(slide.faves))) {
      slide.faves = [];
      update.$set = { faves: [this.userId] };
    } else if (_.include(slide.faves, this.userId)) {
      update.$pull = { faves: this.userId };
    } else {
      update.$push = { faves: this.userId };
    }

    Slides.update({ _id: slideId }, update);
  },

  // this is part of the Meteor Methods advanced boilerplate
  // see http://guide.meteor.com/methods.html#advanced-boilerplate
  call(args, callback) {
    const options = {
      returnStubValue: true,
      throwStubExceptions: true
    }

    Meteor.apply(this.name, [args], options, callback);
  }
};

// Register the methods with Meteor's DDP system
Meteor.methods({
  [Slides.methods.renderSlide.name]: function (args) {
    Slides.methods.renderSlide.validate.call(this, args);
    Slides.methods.renderSlide.run.call(this, args);
  },
  [Slides.methods.saveSlide.name]: function (args) {
    Slides.methods.saveSlide.validate.call(this, args);
    Slides.methods.saveSlide.run.call(this, args);
  },
  [Slides.methods.removeSlide.name]: function (args) {
    Slides.methods.removeSlide.validate.call(this, args);
    Slides.methods.removeSlide.run.call(this, args);
  },
  [Slides.methods.toggleFave.name]: function (args) {
    Slides.methods.toggleFave.validate.call(this, args);
    Slides.methods.toggleFave.run.call(this, args);
  }
});
