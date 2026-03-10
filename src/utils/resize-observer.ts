export function createResizeObserver(
  element: Element,
  callback: (entry: ResizeObserverEntry) => void,
  debounceMs = 100
): ResizeObserver {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const observer = new ResizeObserver((entries) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      const entry = entries[entries.length - 1];
      if (entry) callback(entry);
    }, debounceMs);
  });

  observer.observe(element);
  return observer;
}
