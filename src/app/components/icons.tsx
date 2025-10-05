import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M12 2a2.8 2.8 0 0 1 2.79 2.16L16.2 8.4a2.72 2.72 0 0 0 2.58 1.8h4.02a2.8 2.8 0 0 1 2.15 4.55L20.6 19.1a2.72 2.72 0 0 0-1.02 2.2v.02a2.8 2.8 0 0 1-4.94 1.5L12 17.5l-2.64 5.3A2.8 2.8 0 0 1 4.4 21.32v-.02a2.72 2.72 0 0 0-1.02-2.2L-1.02 14.75A2.8 2.8 0 0 1 1.13 10.2h4.02a2.72 2.72 0 0 0 2.58-1.8L9.21 4.16A2.8 2.8 0 0 1 12 2z"></path>
    </svg>
  ),
};
