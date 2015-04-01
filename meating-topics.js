Topics = new Mongo.Collection("topics");

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("topics");
  Template.topic.helpers({
      isOwner: function () {
        return this.owner === Meteor.userId();
      }
  });
  Template.body.helpers({
    topics: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter topics
        return Topics.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the topics
        return Topics.find({}, {sort: {checked: 1, createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Topics.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    "submit .new-topic": function (event) {
      // This function is called when the new topic form is submitted
      var text = event.target.text.value;

      Meteor.call("addTopic", text);

      // Clear form
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    },
    "submit .login-form": function(event) {
      var username = event.target.username.value
          password = event.target.password.value;

        Meteor.loginWithLdap(username, password, function (err) {
          if (err) {
            console.log("login with ldap failed");
            console.log(err);
          } else {
            console.log("logged in with ldap");
          }
        });
      event.target.password.value = "";
      return false;
    },
    "click .logout": function(event) {
      Meteor.logout();
    }
  });

  Template.topic.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTopic", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

// At the bottom of simple-todos.js, outside of the client-only block
Meteor.methods({
  addTopic: function (text) {
    // Make sure the user is logged in before inserting a topic
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if (typeof(text) !== "string") {
      throw new Meteor.Error("non-string topic");
    }

    Topics.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
      cn: Meteor.user().profile.cn
    });
  },
  deleteTopic: function (topicId) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Topics.remove(topicId);
  },
  setChecked: function (topicId, setChecked) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Topics.update(topicId, { $set: { checked: setChecked} });
  },
  setPrivate: function (topicId, setToPrivate) {
    var topic = Topics.findOne(topicId);

    // Make sure only the topic owner can make a topic private
    if (topic.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Topics.update(topicId, { $set: { private: setToPrivate } });
  }
});

if (Meteor.isServer) {
  Meteor.publish("topics", function () {
    return Topics.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId}
      ]
    });
  });
}

Accounts.config({
  forbidClientAccountCreation : true
});
