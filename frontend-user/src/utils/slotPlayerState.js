export const SLOT_STATES = Object.freeze({
  IDLE: 'idle',
  STARTING: 'starting',
  READY: 'ready',
  SPINNING: 'spinning',
  RESULT: 'result',
  FREE_SPIN: 'free_spin',
  COLLECTING: 'collecting',
  DOUBLE_UP: 'double_up',
  ERROR: 'error',
});

const transitions = {
  [SLOT_STATES.IDLE]: [SLOT_STATES.STARTING],
  [SLOT_STATES.STARTING]: [SLOT_STATES.READY, SLOT_STATES.ERROR],
  [SLOT_STATES.READY]: [SLOT_STATES.SPINNING, SLOT_STATES.COLLECTING, SLOT_STATES.DOUBLE_UP],
  [SLOT_STATES.SPINNING]: [SLOT_STATES.RESULT, SLOT_STATES.FREE_SPIN, SLOT_STATES.ERROR],
  [SLOT_STATES.RESULT]: [SLOT_STATES.READY, SLOT_STATES.FREE_SPIN, SLOT_STATES.COLLECTING, SLOT_STATES.DOUBLE_UP],
  [SLOT_STATES.FREE_SPIN]: [SLOT_STATES.SPINNING, SLOT_STATES.READY, SLOT_STATES.ERROR],
  [SLOT_STATES.COLLECTING]: [SLOT_STATES.READY, SLOT_STATES.ERROR],
  [SLOT_STATES.DOUBLE_UP]: [SLOT_STATES.READY, SLOT_STATES.ERROR],
  [SLOT_STATES.ERROR]: [SLOT_STATES.STARTING, SLOT_STATES.READY],
};

export function canTransition(from, to) {
  return Boolean(transitions[from]?.includes(to));
}

export function transition(from, to) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid slot state transition: ${from} -> ${to}`);
  }
  return to;
}
