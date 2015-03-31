ldap = Meteor.npmRequire("ldapjs");

var updateLDAP = Meteor.bindEnvironment(function () {
  var client = ldap.createClient({
    socketPath: "/var/run/slapd/ldapi",
    maxConnections: 10,
    bindDN: "cn=readonly,dc=yakko,dc=cs,dc=wmich,dc=edu",
    bindCredentials: "Changem3",
  });

  var searchOpts = {
    scope: 'sub',
  };

  var base = "cn=members,dc=yakko,dc=cs,dc=wmich,dc=edu";

  var createCB = Meteor.bindEnvironment(function (entry) {
    var uid = entry.object.uid;
    var cn = entry.object.cn;
    var user = Meteor.users.findOne({username: uid});
    if(!user) {
      var userId;
      user = Meteor.users.insert({username: uid, cn: cn});
      if (userId) {
        console.log("uid: " + uid);
        console.log(" cn: " + cn);
      }
    } else {
      Meteor.users.update({_id: user._id}, {$set: {cn: cn}});
    }

  });

  client.search(base, searchOpts, function (err, res) {
    if (err) {
      console.log(err);
      return;
    }
    res.on('searchEntry', createCB);

    res.on('end', function (result) {
      console.log("done searching");
      console.log(result.status);
    });
  });
});



var cron = new Meteor.Cron( {
  events:{
    "0 * * * *"  : updateLDAP,
  }
});
