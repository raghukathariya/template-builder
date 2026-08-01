import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/** Shared stroke-icon set for the builder shell — hand-drawn rather than an added icon-library
 * dependency, so every icon here stays intentionally minimal (24x24 grid, 1.75 stroke). Keep new
 * additions consistent with that grid so icon buttons never need per-icon size tweaks. */
function base(props: IconProps) {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  };
}

export function IconUndo(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 7 4 12l5 5" />
      <path d="M4 12h11a5 5 0 0 1 0 10h-1" />
    </svg>
  );
}

export function IconRedo(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m15 7 5 5-5 5" />
      <path d="M20 12H9a5 5 0 0 0 0 10h1" />
    </svg>
  );
}

export function IconSave(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M8 4v5h8V4" />
      <path d="M8 20v-6h8v6" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export function IconDuplicate(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16" />
      <path d="M6 7V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2" />
      <path d="M18 7v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconGrip(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconDesktop(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M9 20h6M12 16v4" />
    </svg>
  );
}

export function IconTablet(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="2.5" width="14" height="19" rx="2" />
      <path d="M11.5 18h1" />
    </svg>
  );
}

export function IconMobile(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11.5 18h1" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

export function IconSliders(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 21V10M5 6V3M12 21v-4M12 13V3M19 21v-7M19 10V3" />
      <circle cx="5" cy="13" r="2" />
      <circle cx="12" cy="16" r="2" />
      <circle cx="19" cy="13" r="2" />
    </svg>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c5 0 9 4 10 7-.4 1.2-1.2 2.5-2.3 3.6M6.6 6.6C4.5 8 3.1 9.9 2 12c1 3 5 7 10 7 1.4 0 2.7-.3 3.9-.8" />
      <path d="M9.5 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-.9" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.3-4.3" />
    </svg>
  );
}

export function IconHeading(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 5v14M15 5v14M5 12h10" />
      <path d="M18 8v-.5a1 1 0 0 1 1-1H21" />
    </svg>
  );
}

export function IconParagraph(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

export function IconCursorClick(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3v3M3 6h3M4.5 4.5l2 2" />
      <path d="M9 9l10 4-4 1.6L13.5 19 9 9Z" />
    </svg>
  );
}

export function IconImage(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 5-5 4 4 3-3 4 4" />
    </svg>
  );
}

export function IconContainer(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" strokeDasharray="3.5 3" />
    </svg>
  );
}

export function IconColumns(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
      <path d="M9.5 4v16M14.5 4v16" />
    </svg>
  );
}

export function IconColumn(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="4" width="10" height="16" rx="1.5" />
    </svg>
  );
}

export function IconCode(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
    </svg>
  );
}

export function IconExpand(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function IconMinimize(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 3v3a2 2 0 0 1-2 2H4M15 3v3a2 2 0 0 0 2 2h3M9 21v-3a2 2 0 0 0-2-2H4M15 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

export function IconSquare(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
    </svg>
  );
}
