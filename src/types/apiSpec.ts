export interface ErrorDomain {
  /**
   * An String representation of the error, allows easier identification of the source.
   */
  errorCode: string;
  /**
   * Error specific message. It can also be an console log related to the error.
   */
  errorMsg: string;
}

export interface KeyValueDomain {
  key: string;
  value: string;
}

export interface InvocationDomain {
  /**
   * The timestamp (unix) when the request was sent by the caller
   */
  timestamp?: number;
  /**
   * Headers that should be past to the lambda
   */
  headers?: KeyValueDomain[];
  /**
   * Event / Call Payload
   */
  payload: any;
}

export const EVENT = Object.freeze({
  ChatPostSurveyEmailTranscript: 'denver_post_survey_email_transcript',
  ConversationalCommand: 'conversational_command',
  MessagingNewConversation: 'controllerbot_messaging_new_conversation',
  MessagingTTR: 'controllerbot_messaging_ttr',
  MessagingParticipantChange: 'controllerbot_messaging_participants_change',
  MessagingConversationIdle: 'controllerbot_messaging_conversation_idle',
  MessagingConversationRouting: 'controllerbot_messaging_conversation_routing',
  MessagingLineInOffHours: 'controllerbot_messaging_mid_conversation_msg',
  MessagingConversationEnd: 'controllerbot_messaging_conversation_end',
  MessagingSurveyStarted: 'surveybot_messaging_survey_started',
  MessagingSurveyEnded: 'surveybot_messaging_survey_ended',
  ThirdPartyBotsPostHook: 'bot_connectors_post_hook',
  ThirdPartyBotsErrorHook: 'bot_connectors_error_hook',
  ThirdPartyBotsCustomIntegration: 'bot_connectors_custom_integration',
  ThirdPartyBotsPreHook: 'bot_connectors_pre_hook',
} as const);
