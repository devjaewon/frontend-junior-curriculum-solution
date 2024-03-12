import EventBus from "@kjojs/eventbus";
import { ReactComponent, ReactElement } from "./ReactElement";
import { PatchNode } from "./PatchNode";

interface FiberChild {
  fragmentPatchNode: PatchNode;
  fiber: Fiber;
}

// 참고 소스코드
// : https://github.com/facebook/react/blob/338dddc089d5865761219f02b5175db85c54c489/packages/react-reconciler/src/ReactFiber.js
//
// Fiber는 모듈이라기보다는 렌더링 작업노드에 대한 명세서 객체입니다.
// 이해하기 쉽도록 객체지향 기반의 코드로 변형하여 만들어 보겠습니다.
export class Fiber extends EventBus<{
  rendered: Fiber;
  update: {
    key: string;
    task: (fiber: Fiber) => void;
  };
}> {
  static createRoot(component: ReactComponent) {
    const key = '__root__';

    return new Fiber(
      key,
      null,
      {},
      [],
      component,
      [],
      true,
    );
  }

  static createChild({
    key,
    element,
    parent,
  }: {
    key: string;
    element: ReactElement;
    parent: Fiber;
  }) {
    return new Fiber(
      key,
      parent,
      element.props,
      [],
      element.type as ReactComponent,
      [],
      false,
    );
  }

  static current: Fiber | null = null;
  static stateIndex: number = -1;

  private _childCursor = -1;

  constructor(
    private _key: string,
    private _parent: Fiber | null,
    private _props: Record<string, any>,
    private _states: any[],
    private _component: ReactComponent,
    private _children: Array<FiberChild>,
    private _isRoot: boolean,
    private _patchNode: PatchNode = PatchNode.createFragment(_key),
  ) {
    super();
    this.on('update', fiber => _parent?.emit('update', fiber));
  }
  
  get key() {
    return this._key;
  }

  get props() {
    return this._props;
  }

  get states() {
    return this._states;
  }

  get patchNode() {
    return this._patchNode;
  }

  get name() {
    return this._component.name;
  }

  setRoot() {
    this._isRoot = true;
  }

  next(): Fiber | null {
    this._childCursor++;
    const child = this._children[this._childCursor];
    if (child) {
      return child.fiber;
    }
    if (this._isRoot) {
      return null;
    }
    if (this._parent) {
      return this._parent.next();
    }

    return null;
  }

  async render() {
    Fiber.current = this;
    Fiber.stateIndex = 0;
    const element = this._component(this._props);
    Fiber.current = null;
    Fiber.stateIndex = -1;

    this._patchNode = this._render(element, 0, 0);
    this._parent?.patchNode.replaceDescendants(this._patchNode);
    this.emit('rendered', this);
  }

  reRender(newProps: Record<any, any>) {
    this._props = newProps;
  }

  createDispatcher = (stateIndex: number) => {
    return (state: any) => {
      this.emit('update', {
        key: this._key,
        task: (fiber) => {
          fiber.states[stateIndex] = state;
        }
      });
    };
  }

  copy(parent: Fiber | null): Fiber {
    const newPatchNode = this._patchNode.copy();

    if (parent) {
      if (!parent.patchNode.replaceDescendants(newPatchNode)) {
        throw new Error('알수 없는 오류');
      }
    }

    const fiber = new Fiber(
      this._key,
      parent,
      {...this._props},
      [...this._states],
      this._component,
      [],
      this._isRoot,
      newPatchNode,
    );

    this._children.forEach(child => {
      const childFiber = child.fiber.copy(fiber);

      fiber._children.push({
        fiber: childFiber,
        fragmentPatchNode: childFiber.patchNode, 
      });
    })

    return fiber;
  }

  findDescendants(key: string): FiberChild | null {
    let childIndex = this._findChildIndex(key);
    if (childIndex >= 0) {
      return this._children[childIndex];
    }

    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i].fiber;
      const grandchild = child.findDescendants(key);

      if (grandchild) {
        return grandchild;
      }
    }

    return null;
  }

  isDiffrent(component: ReactComponent): boolean {
    return this._component !== component;
  }

  private _render(
    element: ReactElement,
    depth: number,
    index: number,
  ): PatchNode {
    if (element.isComponent) {
      return this._renderComponent(element, depth, index);
    } else {
      return this._renderElement(element, depth, index);
    }
  }

  private _renderComponent(
    element: ReactElement,
    depth: number,
    index: number,
  ): PatchNode {
    const key = ReactElement.getKey(this._key, depth, index);
    const childIndex = this._findChildIndex(key);
    const child = this._children[childIndex]?.fiber;
    const fragmentPatchNode = PatchNode.createFragment(key);

    if (child && !child.isDiffrent(element.type as ReactComponent)) {
      child.reRender(element.props);

      return fragmentPatchNode;
    }

    const fiberChild: FiberChild = {
      fiber: Fiber.createChild({
        key,
        element,
        parent: this,
      }),
      fragmentPatchNode,
    };

    if (!child) {
      this._children.push(fiberChild);
    } else {
      this._children.splice(childIndex, 1, fiberChild);
    }

    return fragmentPatchNode;
  }

  private _renderElement(
    element: ReactElement,
    depth: number,
    index: number,
  ): PatchNode {
    const props = element.props;
    let onClick = null;
    if (props['onClick']) {
      onClick = props['onClick'];
      delete props['onClick'];
    }

    const key = (depth === 0 && index === 0) ? this._key : ReactElement.getKey(this._key, depth, index);
    const textContent = typeof element.children === 'string' ? element.children : null;
    const patchNode = new PatchNode(
      key,
      element.type as string,
      props,
      [],
      textContent,
      false,
      onClick,
    );

    if (Array.isArray(element.children)) {
      element.children.forEach((child, i) => {
        patchNode.children[i] = this._render(child, depth + 1, i);
      });
    }

    return patchNode;
  }

  private _findChildIndex(key: string): number {
    return this._children.findIndex(child => child.fiber.key === key);
  }
}
