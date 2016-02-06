var fs = Npm.require('fs');

Picker.route('/presentation/:_id', function(params, req, res, next) {
  var pres = Presentations.findOne(params._id);
  res.end(pres.html);
});
