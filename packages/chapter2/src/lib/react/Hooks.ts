import { Fiber } from './Fiber';

export function useState<T = any>(initialState: T) {
  const fiber = Fiber.current;
  if (!fiber) {
    throw new Error('알수없는 오류 발생!');
  }

  const isInitialCall = fiber.states.length - 1 < Fiber.stateIndex;
  const state = isInitialCall ? initialState : fiber.states[Fiber.stateIndex];
  fiber.states[Fiber.stateIndex] = state;

  const dispatcher = fiber.createDispatcher(Fiber.stateIndex);
  Fiber.stateIndex++;

  return [state, dispatcher];
}
