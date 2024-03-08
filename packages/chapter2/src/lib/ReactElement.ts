type ReactFunctionComponent = (...props: any) => ReactElement;

export class ReactElement {
  constructor(
    private _type: string | ReactFunctionComponent,
    private _props: Record<string, any>,
    private _children: Array<ReactElement> | string,
  ) {}

  get type() {
    return this._type;
  }

  get props() {
    return this._props;
  }

  get children() {
    return this._children;
  }
}

export function createElement(
  type: string | ReactFunctionComponent,
  props: Record<string, any> | null,
  children: Array<ReactElement> | string | null,
) {
  return new ReactElement(type, props ?? {}, children ?? []);
}
