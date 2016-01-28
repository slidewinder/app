Template.home.events({
  "click #get-started-btn": function(event) {
    $('#get-started').animate({ height: 0 }, 500);
    $('#login-box').animate({ height: '300px' }, 500);
  }
})
