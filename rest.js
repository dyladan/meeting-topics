
if (Meteor.isServer) {
  Meteor.startup(function () {
    collectionApi = new CollectionAPI({ authToken: '97f0ad9e24ca5e0408a269748d7fe0a0' });
    collectionApi.addCollection(Topics, 'topics', {
      methods: ['GET'],
    });
    collectionApi.start();
  });
}
