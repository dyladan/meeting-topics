Meteor.loginWithLdap = function (username, password, callback) {
  console.log("loginWithLdap");
  Accounts.callLoginMethod({
    methodArguments: [{
      username: username,
      ldap_password: password,
      ldap: true
    }],
    userCallback: callback
  });
};
