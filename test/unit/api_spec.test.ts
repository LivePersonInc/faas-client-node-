import * as index from '../../src/types/apiSpec';

describe('API Spec', () => {
  describe('success flows', () => {
    test('validate public api', () => {
      expect(index.EVENT.DENVER_POST_SURVEY_EMAIL_TRANSCRIPT).toBeDefined();
      expect(index.EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION).toBeDefined();
      expect(index.EVENT.CONTROLLERBOT_MESSAGING_TTR).toBeDefined();
      expect(index.EVENT.CONTROLLERBOT_MESSAGING_PARTICIPANTS_CHANGE).toBeDefined();
      expect(index.EVENT.CONTROLLERBOT_MESSAGING_CONVERSATION_IDLE).toBeDefined();
      expect(index.EVENT.CONTROLLERBOT_MESSAGING_CONVERSATION_ROUTING).toBeDefined();
      expect(index.EVENT.CONTROLLERBOT_MESSAGING_MID_CONVERSATION_MSG).toBeDefined();
      expect(index.EVENT.CONTROLLERBOT_MESSAGING_CONVERSATION_END).toBeDefined();
    });
  });
})
