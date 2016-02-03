Template.create_slide_sidebar.helpers({
  templates: function() {
    return templates;
  }
});

var templates = [
  { name: 'Image only', description: 'Full-size image slide', metadata: {  'background-image': 'input' }, content: '' },
  { name: 'Title with image', description: 'Title with a large image', metadata: {}, content: '# Title\n![](http://lorempixel.com/1200/600/)' }
]

Template.create_slide_sidebar.onRendered(function() {
  insignia($('#md_card_tags')[0], {
    delimiter: ',',
    deletion: true
  });

  $('.collapsible').collapsible();
});

var getSlideData = function() {
  var body = MDEdit['slide-editor-mde'].value();
  var metadata = {};
  var fields = $("#md_card_form input").serializeArray();
  for (x in fields) {
    metadata[fields[x].name] = fields[x].value;
  }
  metadata['background-image'] = metadata.bg_img;
  delete metadata.bg_img;
  metadata.owner = Meteor.userId();
  metadata.license = 'cc-by 4.0';
  metadata.body = body;
  return metadata;
}

var showSlidePreview = function(err, html) {
  $('#slide-editor-content .editor-preview').empty();
  $('<iframe>')
    .attr('id', 'preview-frame')
    .appendTo('#slide-editor-content .editor-preview');
  var iframe = $('#preview-frame')[0];
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(html);
  iframe.contentWindow.document.close();
}

Template.create_slide.events({
  'click .editor-toolbar > a.fa.fa-eye': function(e) {
    e.stopPropagation();
    if ($('a.fa.fa-eye').hasClass('active')) {
      var slidedata = getSlideData();
      var author = Meteor.user().profile.name;
      Meteor.call('renderSlide', author, slidedata, showSlidePreview);
    }
    return false;
  },
  'click #save_slide_btn': function(e) {
    var slidedata = getSlideData();
    Meteor.call('saveSlide', slidedata);
    FlowRouter.go('/library');
  }
})

Template.create_slide_sidebar.events({
  'click #md_addfield_btn': function() {
    var field_name = $('#field_name').val();
    $('#field_name').val('');
    var field_div = $('<div>').attr('class', 'input-field');
    var field_id = 'md_card_' + field_name;
    $('<input>')
      .attr('name', field_name)
      .attr('id', field_id)
      .attr('type', 'text')
      .appendTo(field_div);
    $('<label>')
      .attr('for', field_id)
      .text(field_name)
      .appendTo(field_div);
    field_div.appendTo('#md_card_form');
  }
});

Template.slide_card.events({
  'mouseover .slide-card': function(e) {
    $(this).find('.card-menu').addClass('active');
  },
  'mouseout .slide-card': function(e) {
    $(this).find('.card-menu').removeClass('active');
  }
});
