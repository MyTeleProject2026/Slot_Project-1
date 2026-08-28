const listeners = new Set();
let enabled = true;

export function setSlotAudioEnabled(value) {
  enabled = Boolean(value);
  emit({ type: 'enabled', enabled });
}

export function isSlotAudioEnabled() {
  return enabled;
}

export function onSlotAudioEvent(listener) {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitSlotAudioEvent(type, payload = {}) {
  if (!enabled && type !== 'enabled') return;
  emit({ type, ...payload });
}

function emit(event) {
  for (const listener of listeners) {
    try { listener(event); } catch (_) { /* audio must never break gameplay */ }
  }
}
