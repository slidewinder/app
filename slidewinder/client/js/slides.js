Template.create_slide.helpers({
  templates: function() {
    return templates;
  }
});

var templates = [
  { name: 'Image only', description: 'Full-size image slide', metadata: {  'background-image': 'input' }, content: '' },
  { name: 'Title with image', description: 'Title with a large image', metadata: {}, content: '# Title\n![](http://lorempixel.com/1200/600/)' }
]

Template.create_slide.onRendered(function() {
  insignia($('#md_card_tags')[0], {
    delimiter: ',',
    deletion: true
  });
})

Template.create_slide.events({
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
  },
  'click .editor-toolbar > a.fa.fa-eye': function(e) {
    e.stopPropagation();
    if ($('a.fa.fa-eye').hasClass('active')) {
      var body = MDEdit['slide-editor-mde'].value();
      var metadata = {};
      var fields = $("#md_card_form input").serializeArray();
      for (x in fields) {
        metadata[fields[x].name] = fields[x].value;
      }
      metadata.body = body;
      Meteor.call('renderSlide', Meteor.user().profile.name, metadata, function(err, html) {
        $('#slide-editor-content .editor-preview').empty();
        $('<iframe>')
          .attr('id', 'preview-frame')
          .appendTo('#slide-editor-content .editor-preview');
        var iframe = $('#preview-frame')[0];
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(html);
        iframe.contentWindow.document.close();
      });
    }
    return false;
  }
})
