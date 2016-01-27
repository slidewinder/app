FlowRouter.route('/', {
  action: function() {
    BlazeLayout.render("index", {content: "home"});
  }
});
