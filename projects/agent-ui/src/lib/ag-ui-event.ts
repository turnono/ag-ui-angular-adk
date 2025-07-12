export type AGUIEvent =
  | { type: 'TEXT_MESSAGE_CONTENT'; text: string }
  | { type: 'TOOL_CALL_START'; tool: string; args: unknown }
  | { type: 'IMAGE_URL_CONTENT'; url: string; alt?: string }
  | { type: 'BUTTON_RESPONSE_REQUEST'; label: string; value: string }
  | { type: 'TASK_TREE_UPDATE'; nodes: unknown };
