Template.landing.events({
  "click #get-started-btn": function(event) {
    $('#get-started').animate({ height: 0 }, function() {
      $('#home-wrapper').animate({ 'margin-top': '5%' });
      $('#login-box').animate({ height: '700px' });
    }).hide();
  }
})
