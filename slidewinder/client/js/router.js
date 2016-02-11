FlowRouter.route('/', {
  action: function() {
    BlazeLayout.render("index");
  }
});

var slidesSection = FlowRouter.group({
  prefix: '/slides'
});

slidesSection.route('/', {
  action: function() {
    BlazeLayout.render("tiered", {content: "slides"});
  }
});

slidesSection.route('/create', {
  action: function() {
    BlazeLayout.render("tiered", {content: "create_slide"});
  }
});

slidesSection.route('/edit/:slideId', {
  action: function() {
    BlazeLayout.render("tiered", {content: "edit_slide"});
  }
});

var decksSection = FlowRouter.group({
  prefix: '/decks'
});

decksSection.route('/', {
  action: function() {
    BlazeLayout.render("tiered", {content: "decks"});
  }
});

decksSection.route('/create', {
  action: function() {
    BlazeLayout.render("tiered", {content: "create_deck"});
  }
});

FlowRouter.route('/help', {
  action: function() {
    BlazeLayout.render("tiered", {content: "help"});
  }
});

FlowRouter.route('/logout', {
  action: function() {
    Meteor.logout(function(err) {
      FlowRouter.go('/');
    });
  }
});
