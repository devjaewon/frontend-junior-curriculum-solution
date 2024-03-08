import { FiberRoot } from "./FiberRoot";
import { ReactElement } from "./ReactElement";
import { Reconciler } from "./Reconciler";

// 참고 소스코드
// : https://github.com/facebook/react/blob/main/packages/react-dom/src/client/ReactDOMRoot.js#L87-L119
class ReactDOMRoot {
  constructor(
    private _reconciler: Reconciler,
  ) {}

  render(element: ReactElement) {
    this._reconciler.update(element);
  }
}

export function createRoot(containerElement: HTMLElement): ReactDOMRoot {
  const fiberRoot = new FiberRoot(containerElement);
  const reconciler = new Reconciler(fiberRoot);

  return new ReactDOMRoot(reconciler);
}
