import type { ReactNode } from 'react';

export interface BlockRenderProps<TProps = Record<string, unknown>> {
  id: string;
  props: TProps;
  selected: boolean;
  onChangeProps: (patch: Partial<TProps>) => void;
  /** Recursively-rendered child blocks — only meaningful for `meta.canHaveChildren` blocks. */
  children?: ReactNode;
}
