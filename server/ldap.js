ldap = Meteor.npmRequire("ldapjs");
Future = Meteor.npmRequire("fibers/future");

Accounts.registerLoginHandler('ldap',function (options) {
  if (!options.ldap)
    return undefined;
  var future = new Future();
  var cn;
  var client = ldap.createClient({
    socketPath: "/var/run/slapd/ldapi",
    maxConnections: 10,
    bindDN: "cn=readonly,dc=yakko,dc=cs,dc=wmich,dc=edu",
    bindCredentials: "Changem3"
  });

  var searchOpts = {
    scope: 'sub',
    filter: "(uid=" + options.username + ")"
  };

  var base = "dc=yakko,dc=cs,dc=wmich,dc=edu";

  var userId;
  var cb =  Meteor.bindEnvironment(function (err) {
    if (!err) {
      var user = Meteor.users.findOne({username: options.username});
      if(!user) {
        userId = Meteor.users.insert({username: options.username, profile: {cn: cn}});
      } else {
        userId = user._id;
      }
    }
    future.return();
  });

  var searchCB = Meteor.bindEnvironment(function (entry) {
    cn = entry.object.cn;
    var dn = entry.objectName;
    client.bind(dn, options.ldap_password, cb);
  });

  client.search(base, searchOpts, function (err, res) {
    res.on('searchEntry', searchCB);
  });


  future.wait();

  if (userId)
    return {userId: userId};

  return {error: new Meteor.Error(403, "Incorrect password")}



});
