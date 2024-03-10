import { PatchNode } from "./react/PatchNode";

interface RenderUnit {
  patch: PatchNode;
  parent: Element;
  index: number;
}

class Renderer {
  constructor(
    private _containerElement: HTMLElement,
  ) {}

  apply(patch: PatchNode) {
    const queue: Array<RenderUnit> = [{
      patch,
      parent: this._containerElement,
      index: 0,
    }];

    while (queue.length > 0) {
      const unit = queue.shift()!;
      const patch = unit.patch.flat();
      if (patch) {
        unit.patch = patch;
      } else {
        continue;
      }

      const parent = this._sync(unit);
      const patchChildren = unit.patch.children;
      if (patchChildren && Array.isArray(patchChildren)) {
        queue.push(...patchChildren.map((patch, i) => ({
          patch,
          parent,
          index: i,
        })));
      }
    }
  }

  private _sync({ patch, parent, index }: RenderUnit): Element {
    if (!parent.children || !parent.children[index]) {
      return this._appendNew(patch, parent);
    }

    // TODO: update logic
    return this._appendNew(patch, parent);
  }

  private _appendNew(patchNode: PatchNode, parent: Element): Element {
    const patch = patchNode.isFragment ? (patchNode.children as PatchNode[])[0] : patchNode;
    const textContent = typeof patch.children === 'string' ? patch.children : '';
    const className = patch.attributes['className']
    const attributes = className ? ` class="${className}"` : '';
    const domHtml = `<${patch.tagName}${attributes}>${textContent}</${patch.tagName}>`;

    parent.insertAdjacentHTML('beforeend', domHtml);

    const element = parent.lastElementChild as HTMLElement;

    if (patch.attributes['onClick']) {
      element.addEventListener('click', patch.attributes['onClick']);
    }

    return element;
  }
}

export default Renderer;
