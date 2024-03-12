import fiberIndicator from "./FiberIndicator";
import fiberTransition from "./FiberTransition";

export function useState<T = any>(initialState: T) {
  const fiber = fiberIndicator.cursor;
  if (!fiber) {
    throw new Error('알수없는 오류 발생!');
  }

  const isInitialCall = fiber.pendingStates.length - 1 < fiberIndicator.stateIndex;
  const state = isInitialCall ? initialState : fiber.pendingStates[fiberIndicator.stateIndex];
  fiber.pendingStates[fiberIndicator.stateIndex] = state;

  const dispatcher = fiber.createDispatcher(fiberIndicator.stateIndex);
  fiberIndicator.stateIndex++;

  return [state, dispatcher];
}

interface StartTransition {
  (callback: () => void): void;
  __key__: string;
}

export function useTransition(): [boolean, StartTransition] {
  const startTransition: StartTransition = (callback: () => void) => {
    fiberTransition.transitionKey = startTransition.__key__;
    callback();
    fiberTransition.transitionKey = null;
  };
  startTransition.__key__ = fiberIndicator.cursor?.key || '';

  return [
    fiberTransition.isTransitionPending,
    startTransition,
  ];
}
