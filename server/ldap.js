ldap = Meteor.npmRequire("ldapjs");
Future = Meteor.npmRequire("fibers/future");

Accounts.registerLoginHandler('ldap',function (options) {
  if (!options.ldap)
    return undefined;
  var future = new Future();
  var client = ldap.createClient({
    socketPath: "/var/run/slapd/ldapi",
  });
  var userId;
  var dn = "uid=" + options.username + ",cn=members,dc=yakko,dc=cs,dc=wmich,dc=edu";
  var cb =  Meteor.bindEnvironment(function (err) {
    if (!err) {
      var user = Meteor.users.findOne({username: options.username});
      if(!user) {
        userId = Meteor.users.insert({username: options.username});
      } else {
        userId = user._id;
      }
    }
    future.return();
  });
  client.bind(dn, options.ldap_password, cb);

  future.wait();

  if (userId)
    return {userId: userId};

  return {error: new Meteor.Error(403, "Incorrect password")}



});
