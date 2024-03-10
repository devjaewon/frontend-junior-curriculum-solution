import { Fiber } from "./Fiber";
import { PatchNode } from "./PatchNode";
import { ReactComponent } from "./ReactElement";

export class FiberRoot {
  private _fiber: Fiber;
  private _patch: PatchNode | null = null;

  constructor(
    component: ReactComponent,
  ) {
    this._fiber = Fiber.createRoot(component);
    this._fiber.on('rendered', (fiber) => {
      this._patch = fiber.fragmentPatchNode;
    });
  }

  get current(): Fiber {
    return this._fiber;
  }

  get patchNode(): PatchNode {
    const { _patch: patch } = this;
    if (!patch) {
      throw new Error('알수없는 오류');
    }

    return patch;
  }
}
