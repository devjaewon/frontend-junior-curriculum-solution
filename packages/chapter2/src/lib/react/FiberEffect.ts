import { Fiber } from "./Fiber";

export interface FiberEffect {
  key: string;
  task: (fiber: Fiber) => void;
}
