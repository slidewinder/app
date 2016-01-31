Template.landing.events({
  "click #get-started-btn": function(event) {
    $('#get-started').animate({ height: 0 }, 500, function() {
      $('#landing-wrapper').animate({ 'margin-top': '5%' });
      $('#login-box').animate({ height: '700px' }, 800);
    });
  }
})
