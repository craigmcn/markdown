/// <reference types="vite/client" />

interface AceEditor {
  getValue(): string;
  setValue(value: string): void;
  clearSelection(): void;
  resize(): void;
  session: {
    selection: {
      on(event: string, handler: (e: unknown) => void): void;
    };
  };
}

interface AceStatic {
  edit(id: string, options?: Record<string, unknown>): AceEditor;
}

declare const ace: AceStatic;

declare module "@joplin/turndown-plugin-gfm" {
  import type TurndownService from "turndown";
  export const gfm: TurndownService.Plugin;
}
