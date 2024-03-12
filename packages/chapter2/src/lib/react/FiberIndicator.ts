import { Fiber } from "./Fiber"

interface FiberIndicator {
  cursor: Fiber | null;
  stateIndex: number;
}

const fiberIndicator: FiberIndicator = {
  cursor: null,
  stateIndex: -1,
}

export default fiberIndicator;
