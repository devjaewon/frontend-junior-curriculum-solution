interface FiberTransition {
  transitionKey: string | null;
  isTransitionPending: boolean;
}

const fiberTransition: FiberTransition = {
  transitionKey: null,
  isTransitionPending: false,
}

export default fiberTransition;
