import type { FocusEvent, MouseEvent } from 'react';
import type { BlockRenderProps } from '../types';
import type { ButtonProps } from './schema';

export function ButtonRenderer({ props, selected, onChangeProps }: BlockRenderProps<ButtonProps>) {
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const label = event.currentTarget.textContent ?? '';
    if (label !== props.label) onChangeProps({ label });
  };

  return (
    <span
      role="button"
      className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white outline-none"
      // See HeadingRenderer for why this is `selected`, not unconditionally `true`.
      contentEditable={selected}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onClick={(event: MouseEvent) => event.preventDefault()}
    >
      {props.label}
    </span>
  );
}
