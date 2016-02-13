Template.slides.helpers({
  slidesIndex: function() { return SlideIndex; }
});

Template.slides.events({
  'click #new-slide-btn': function() {
    FlowRouter.go('/slides/create');
  },
  'click .edit-slide-btn': function() {
    // only the owner can edit a slide - also enforced in the router,
    // and on the server
    if (Meteor.userId() === this.owner) {
      FlowRouter.go('/slides/edit/' + this.__originalId);
    } else {
      Materialize.toast("You can only edit slides that belong to you.", 4000, 'flash-err');
    }
  },
  'click .delete-slide-btn': function() {
    var div = $('<div>')
      .attr('class', 'confirm-delete')
      .html('<h5>Really delete this slide?</h5>');
    $('<button>')
      .attr('class', 'confirm-slide-del-btn')
      .text('yes')
      .appendTo(div);
    $('<button>')
      .attr('class', 'cancel-slide-del-btn')
      .text('no')
      .appendTo(div);
    var card = $('#' + this.__originalId);
    div.appendTo(card);
  },
  'click .fave-slide-btn': function() {
    Slides.methods.toggleFave.call({
      slideId: this.__originalId
    }, (err, res) => {
      if (err) {
        Materialize.toast(err, 4000, 'flash-err');
      }
    });
  },
  'click .confirm-slide-del-btn': function() {
    Slides.methods.removeSlide.call({
      slideId: this.__originalId
    }, (err, res) => {
      if (err) {
        Materialize.toast(err, 4000, 'flash-err');
      }
    });
  },
  'click .cancel-slide-del-btn': function() {
    $('#' + this.__originalId).find('.confirm-delete').remove();
  },
  'change #me-or-everyone': function() {
    var everyone = $('#me-or-everyone')[0].checked;
    console.log('Switching slides subscription to everyone =', everyone);
    Session.get('decks.show-everyone', everyone);
  }
})

Template.slide_card.helpers({
  image: function() {
    return this['background-image'];
  }
})

Template.slide_text_card.helpers({
  truncatedContent: function() {
    return this.body;
  },
  id: function() {
    // we use __originalId because Easy-Search creates a new ID
    return this.__originalId;
  },
  n_faves: function() {
    return this.faves.length || 0;
  }
})

Template.slide_image_card.helpers({
  truncatedContent: function() {
    return this.body;
  },
  image: function() {
    return this['background-image'];
  },
  id: function() {
    // we use __originalId because Easy-Search creates a new ID
    return this.__originalId;
  },
  n_faves: function() {
    return this.faves.length || 0;
  }
})

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
  var metadata = {};
  var fields = $("#md_card_form input").serializeArray();
  for (x in fields) {
    var field = fields[x];
    if (field.name == 'bg_img') {
      var bg_img = metadata.bg_img;
      if (bg_img) {
        bg_img = 'url(' + bg_img + ')';
      }
      metadata['background-image'] = bg_img;
      delete metadata.bg_img;
    } else if (field.name == 'tags') {
      metadata.tags = insignia($('#md_card_tags')[0]).tags();
    } else {
      metadata[fields[x].name] = fields[x].value;
    }
  }
  metadata.body = MDEdit['slide-editor-mde'].value();
  if (FlowRouter.current().path == '/slides/create') {
    // this is a new slide
    metadata.faves = [];
    metadata.owner = Meteor.userId();
    metadata.license = 'cc-by 4.0';
    metadata.private = false;
  } else {
    // editing an existing slide, so we merge the edited properties
    // into the original slide
    metadata._id = FlowRouter.getParam("slideId");
    var slide = Slides.findOne(metadata._id);
    metadata = _.extend(slide, metadata);
  }
  return metadata;
}

var setSlideData = function(data) {
  data = _.clone(data);
  // keys we know about
  MDEdit['slide-editor-mde'].value(data.body);
  delete data.body;
  $('#md_card_title').val(data.title);
  delete data.title;
  $('#md_card_author').val(data.author);
  delete data.author;
  $('#md_card_bg_img').val(data['background-image']);
  $('#md_card_bg_img').parent().find('label').addClass('active');
  delete data['background-image'];
  $('#md_card_tags').val(data.tags.join(','));
  $('#md_card_tags').parent().find('label').addClass('active');
  delete data.tags;
  insignia($('#md_card_tags')[0], {
    delimiter: ',',
    deletion: true
  });
  // any custom keys, excluding hidden keys
  var hidden_keys = ['_id', 'parent', 'children', 'faves',
    'owner', 'status', 'license', 'status', 'data'];
  _.difference(Object.keys(data), hidden_keys).forEach(function(key) {
    var new_id = makeNewField(key);
    var cont = $('#' + new_id);
    cont.val(data[key]);
    cont.parent().find('label').addClass('active');
  });
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

var makeNewField = function(field_name) {
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
  return field_id;
}

Template.create_slide.events({
  'click .editor-toolbar > a.fa.fa-eye': function(e) {
    e.stopPropagation();
    if ($('a.fa.fa-eye').hasClass('active')) {
      var slidedata = getSlideData();
      var author = Meteor.user().profile.name;
      Slides.methods.renderSlide.call(
        { author: author, slidedata: slidedata },
        showSlidePreview
      );
    }
    return false;
  },
  'click #save_slide_btn': function(e) {
    var slidedata = getSlideData();
    Slides.methods.saveSlide.call({
      slidedata: slidedata
    }, (err, res) => {
      if (err) {
        Materialize.toast(err, 4000, 'flash-err');
        setTimeout(function(){ FlowRouter.go('/slides') }, 2000);
      } else {
        FlowRouter.go('/slides');
      }
    });
  }
})

Template.create_slide_sidebar.events({
  'click #md_addfield_btn': function() {
    var field_name = $('#field_name').val();
    $('#field_name').val('');
    makeNewField(field_name);
  }
});

Template.slide_card.events({
  'mouseenter .slide-card': function(e) {
    $(e.target).find('.card-menu').show();
  },
  'mouseleave .slide-card': function(e) {
    $(e.target).find('.card-menu').hide();
  }
});

Template.edit_slide.onRendered(function() {
  // load the card for editing
  var slide_id = FlowRouter.getParam("slideId");
  var res = Slides.find(slide_id);

  if (res.count() == 0) {
    Materialize.toast("The slide you're trying to edit doesn't exist :(", 4000, 'flash-err');
    setTimeout(function(){ FlowRouter.go('/slides') }, 2000);
    return;
  }

  var slide = res.fetch()[0];

  if (Meteor.userId() != slide.owner) {
    Materialize.toast("You can only edit slides that belong to you.", 4000, 'flash-err');
    setTimeout(function(){ FlowRouter.go('/slides') }, 2000);
    return;
  }

  setSlideData(slide);

});
