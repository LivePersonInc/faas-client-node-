/**
 * Testing stuff.
 */

const { Client } = require('./build/src');

const client = new Client({
  accountId: '',
  authStrategy: {
    clientId: '',
    clientSecret: '',
  },
  failOnErrorStatusCode: true,
});
client
  .invoke({
    lambdaUuid: '',
    externalSystem: 'testSystem',
    body: {
      headers: [],
      payload: {
        name: 'abc',
      },
    },
  })
  .then(console.info)
  .catch(({ message }) => console.error(message));

client
  .invoke({
    eventId: 'conversational_command',
    externalSystem: 'testSystem',
    body: {
      headers: [],
      payload: {
        name: 'abc',
      },
    },
  })
  .then(console.info);

client
  .isImplemented({
    eventId: 'conversational_command',
    externalSystem: 'testSystem',
  })
  .then(console.info);
