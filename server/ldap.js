ldap = Meteor.npmRequire("ldapjs");

Accounts.registerLoginHandler('ldap',function (options) {
  if (!options.ldap)
    return undefined;
  var userId;
  var bindcb = Meteor.bindEnvironment(function (err) {
        if (!err) {
          userId = Accounts.createUser({
            username: options.username,
            password: options.ldap_password
          });

          console.log(options);
          console.log(userId + "created");
          return {userId: userId};
        } else {
          console.log(err);
        }
      });
  var client = ldap.createClient({
    socketPath: "/var/run/slapd/ldapi",
    maxConnections: 10,
    bindDN: "cn=readonly,dc=yakko,dc=cs,dc=wmich,dc=edu",
    bindCredentials: "Changem3"
  });

  var searchOptions = {
    scope: 'sub',
    filter: "(uid=" + options.username + ")"
  };
  return client.search("cn=members,dc=yakko,dc=cs,dc=wmich,dc=edu", searchOptions, function (err,res) {
    res.on('searchEntry', function (entry) {
      client.bind(entry.dn, options.ldap_password, bindcb);
    });
  });
});
