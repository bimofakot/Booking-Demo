import type { SVGProps } from 'react';

export function ShuttleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7.4 4.4h9.2l-2.7 9.2h-3.8L7.4 4.4Z" />
      <path d="M9.7 4.4 11.1 13.4M12 4.4v9M14.3 4.4l-1.4 9" />
      <circle cx="12" cy="17.4" r="2.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
