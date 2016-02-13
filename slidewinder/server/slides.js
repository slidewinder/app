// Publish the collection, optionally giving access to all public slides
// or only the user's own slides.
Meteor.publish("slides", function (everyone) {
  var cond = [
    { owner: this.userId }
  ]
  if (everyone) {
    cond.push({ private: false });
  }
  return Slides.find({
    $or: cond
  });
});
