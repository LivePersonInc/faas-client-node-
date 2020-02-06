import * as index from '../../src/types/apiSpec';

describe('API Spec', () => {
  describe('success flows', () => {
    test('validate public api', () => {
      expect(index.EVENT.ChatPostSurveyEmailTranscript).toBeDefined();
      expect(index.EVENT.ConversationalCommand).toBeDefined();
      expect(index.EVENT.MessagingNewConversation).toBeDefined();
      expect(index.EVENT.MessagingConversationEnd).toBeDefined();
      expect(index.EVENT.MessagingConversationIdle).toBeDefined();
      expect(index.EVENT.MessagingConversationRouting).toBeDefined();
      expect(index.EVENT.MessagingLineInOffHours).toBeDefined();
      expect(index.EVENT.MessagingParticipantChange).toBeDefined();
      expect(index.EVENT.MessagingTTR).toBeDefined();
      expect(index.EVENT.MessagingSurveyStarted).toBeDefined();
      expect(index.EVENT.MessagingSurveyEnded).toBeDefined();
      expect(index.EVENT.ThirdPartyBotsPostHook).toBeDefined();
      expect(index.EVENT.ThirdPartyBotsErrorHook).toBeDefined();
      expect(index.EVENT.ThirdPartyBotsCustomIntegration).toBeDefined();
      expect(index.EVENT.ThirdPartyBotsPostHook).toBeDefined();
    });
  });
});
