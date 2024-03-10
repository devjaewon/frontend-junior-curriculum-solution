// React에서는 다른 방식으로 처리하지만 (updateQueue, Lane)
// 현재 구조에 맞게 변경사항을 업데이트 하기 위한 객체입니다.
export class PatchNode {
  static fragmentKey = '__fragment__';

  static createFragment(key: string) {
    return new PatchNode(
      key,
      PatchNode.fragmentKey,
      {},
      [],
      false,
    );
  }

  constructor(
    // key 값입니다.
    private _key: string,
    // type이 문자열이면 렌더링 할 요소의 tagName을 의미합니다.
    // 함수가 들어오면 렌더링 해야할 컴포넌트입니다.
    private _tagName: string,
    // 속성 객체입니다.
    private _attributes: Record<string, any>,
    // 자식 요소입니다.
    private _children: Array<PatchNode> | string | null,
    // dirty가 true면 변경사항을 반영해야 합니다.
    private _dirty: boolean,
  ) {}

  get key() {
    return this._key;
  }

  get tagName() {
    return this._tagName;
  }

  get attributes() {
    return this._attributes;
  }

  get children() {
    return this._children;
  }

  get dirty() {
    return this._dirty;
  }

  get isFragment() {
    return this._tagName === PatchNode.fragmentKey;
  }

  appendPatchNode(patchNode: PatchNode) {
    this._children = Array.isArray(this._children) ? this._children : [];
    this._children.push(patchNode);
  }

  flat(): PatchNode | null {
    if (!this.isFragment) {
      return this;
    }
    if (Array.isArray(this._children) && this._children.length > 0) {
      return this._children.find(patchNode => !patchNode.isFragment) || null;
    }

    return null;
  }
}
