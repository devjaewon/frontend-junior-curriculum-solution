import EventBus from "@kjojs/eventbus";
import { ReactComponent, ReactElement } from "./ReactElement";
import { PatchNode } from "./PatchNode";

// 참고 소스코드
// : https://github.com/facebook/react/blob/338dddc089d5865761219f02b5175db85c54c489/packages/react-reconciler/src/ReactFiber.js
//
// Fiber는 모듈이라기보다는 렌더링 작업노드에 대한 명세서 객체입니다.
// 이해하기 쉽도록 객체지향 기반의 코드로 변형하여 만들어 보겠습니다.
export class Fiber extends EventBus<{
  rendered: Fiber;
}> {
  static createRoot(component: ReactComponent) {
    const key = '__root__';

    return new Fiber(
      key,
      null,
      [],
      {},
      component,
      true,
    );
  }

  static createChild({
    element,
    parent,
  }: {
    element: ReactElement;
    parent: Fiber;
  }) {
    return new Fiber(
      ReactElement.getKey(element),
      parent,
      [],
      element.props,
      element.type as ReactComponent,
      false,
    );
  }

  private _children: Array<Fiber> = [];
  private _childCursor = -1;
  private _frgamentPatchNode: PatchNode;

  constructor(
    private _key: string,
    private _parent: Fiber | null,
    private _states: any[],
    private _props: Record<string, any>,
    private _component: ReactComponent,
    private _isRoot: boolean,
  ) {
    super();
    this._frgamentPatchNode = PatchNode.createFragment(_key);
  }
  
  get key() {
    return this._key;
  }

  get fragmentPatchNode() {
    return this._frgamentPatchNode;
  }

  next(): Fiber | null {
    this._childCursor++;
    const child = this._children[this._childCursor];
    if (child) {
      return child;
    }
    if (this._isRoot) {
      return null;
    }
    if (this._parent) {
      return this._parent.next();
    }

    return null;
  }

  render() {
    const element = this._component(this._props);
    const patchNode = this._render(element);

    this._frgamentPatchNode.appendPatchNode(patchNode);
    this.emit('rendered', this);
  }

  private _render(element: ReactElement): PatchNode {
    if (element.isComponent) {
      return this._recognizeComponent(element);
    } else {
      return this._renderElement(element);
    }
  }

  private _recognizeComponent(element: ReactElement) {
    let child = this._findChild(ReactElement.getKey(element));

    if (!child) {
      child = Fiber.createChild({
        element,
        parent: this,
      });
      this._children.push(child);
    }


    return child.fragmentPatchNode;
  }

  private _renderElement(element: ReactElement): PatchNode {
    const patchNode = new PatchNode(
      // root 요소의 경우 키값을 fiber의 키로 넣어준다. (함수 이름. ex Home)
      parent === null ? this._key : ReactElement.getKey(element),
      element.type as string,
      element.props,
      Array.isArray(element.children)
        ? element.children.map(child => this._render(child))
        : element.children,
      false,
    );

    return patchNode;
  }

  private _findChild(key: string): Fiber | null {
    return this._children.find(child => child.key === key) || null;
  }

  // next(initialState: any) {
  //   if (this._states.length - 1 < this._stateCursor) {
  //     this._states[this._stateCursor] = initialState;
  //   }

  //   const state = this._states[this._stateCursor];
    
  //   this._stateCursor++;

  //   return state;
  // }

  // createDispatcher = () => {
  //   const stateCursor = this._stateCursor;

  //   return (state: any) => {
  //     this._states[stateCursor] = state;
  //     this.emit('setState', this);
  //   };
  // }
}
