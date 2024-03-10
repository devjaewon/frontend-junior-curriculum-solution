import { Fiber } from './Fiber';

export function useState<T = any>(initialState: T) {
  // const fiber = Fiber.current;
  // if (!fiber) {
  //   throw new Error('알수없는 오류 발생!');
  // }

  // const dispatcher = fiber.createDispatcher();
  // const state = fiber.next(initialState);

  // return [state, dispatcher];
}
