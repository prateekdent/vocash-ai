let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export function triggerUnauthorizedHandler(): void {
  if (onUnauthorized) {
    onUnauthorized();
  }
}
