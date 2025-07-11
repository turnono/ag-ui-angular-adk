export type AgEvent =
  | { type: 'text'; content: string }
  | { type: 'button'; label: string; value: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'tool'; tool: string; args: unknown }
  | { type: 'task-tree'; nodes: unknown };
