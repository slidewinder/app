FlowRouter.route('/', {
  action: function() {
    if (Meteor.userId()) {
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
