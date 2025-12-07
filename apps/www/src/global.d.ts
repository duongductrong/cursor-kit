/// <reference types="@solidjs/start/env" />

declare module "*.md?raw" {
  const content: string;
  export default content;
}
