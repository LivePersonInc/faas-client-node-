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

export const Event = Object.freeze({
  DENVER_POST_SURVEY_EMAIL_TRANSCRIPT: 'denver_post_survey_email_transcript',
  CONTROLLERBOT_MESSAGING_NEW_CONVERSATION: 'controllerbot_messaging_new_conversation',
  CONTROLLERBOT_MESSAGING_TTR: 'controllerbot_messaging_ttr',
  CONTROLLERBOT_MESSAGING_PARTICIPANTS_CHANGE: 'controllerbot_messaging_participants_change',
  CONTROLLERBOT_MESSAGING_CONVERSATION_IDLE: 'controllerbot_messaging_conversation_idle',
  CONTROLLERBOT_MESSAGING_CONVERSATION_ROUTING: 'controllerbot_messaging_conversation_routing',
  CONTROLLERBOT_MESSAGING_MID_CONVERSATION_MSG: 'controllerbot_messaging_mid_conversation_msg',
  CONTROLLERBOT_MESSAGING_CONVERSATION_END: 'controllerbot_messaging_conversation_end',
} as const);
