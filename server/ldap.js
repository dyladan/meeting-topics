ldap = Meteor.npmRequire("ldapjs");
Future = Meteor.npmRequire("fibers/future");

Accounts.registerLoginHandler('ldap',function (options) {
  if (!options.ldap)
    return undefined;
  var future = new Future();
  var client = ldap.createClient({
    socketPath: "/var/run/slapd/ldapi",
    maxConnections: 10,
    bindDN: "cn=readonly,dc=yakko,dc=cs,dc=wmich,dc=edu",
    bindCredentials: "Changem3"
  });
  var userId;
  var dn = "uid=" + options.username + ",cn=members,dc=yakko,dc=cs,dc=wmich,dc=edu";
  var cb =  Meteor.bindEnvironment(function (err) {
    if (!err) {
      userId = Accounts.createUser({
        username: options.username,
        password: options.ldap_password
      });
    }
    future.return();
  });
  console.log(client.bind(dn, options.ldap_password, cb));

  console.log("userId: "+userId);

  future.wait();

  return {userId: userId};


});
