FlowRouter.route('/', {
  action: function() {
    if (Meteor.user() || Meteor.loggingIn()) {
      FlowRouter.go('/home');
    } else {
      BlazeLayout.render("index", {content: "landing"});
    }
  }
});

FlowRouter.route('/home', {
  action: function() {
    BlazeLayout.render("index", {content: "home"});
  }
});

var slidesSection = FlowRouter.group({
  prefix: '/slides'
});

slidesSection.route('/create', {
  action: function() {
    BlazeLayout.render("tiered", {content: "create_slide"});
  }
});

var decksSection = FlowRouter.group({
  prefix: '/decks'
});

decksSection.route('/create', {
  action: function() {
    BlazeLayout.render("tiered", {content: "create_deck"});
  }
});

decksSection.route('/present', {
  action: function() {
    BlazeLayout.render("tiered", {content: "present_deck"});
  }
});

FlowRouter.route('/library', {
  action: function() {
    BlazeLayout.render("tiered", {content: "library"});
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
