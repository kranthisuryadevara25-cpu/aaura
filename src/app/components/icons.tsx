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
      <path d="M12 22a2.9 2.9 0 0 1-2.1-.88c-1-1.12-1.55-2.6-1.55-4.12 0-2.4 1.2-4.59 3.1-5.63" />
      <path d="M12 22a2.9 2.9 0 0 0 2.1-.88c1-1.12 1.55-2.6 1.55-4.12 0-2.4-1.2-4.59-3.1-5.63" />
      <path d="M15.55 11.37c.3-.15.45-.37.45-.67 0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1 0 .3.15.52.45.67C9.1 11.82 10.5 12.5 12 14c1.5-1.5 2.9-.18 3.55-2.63z" />
      <path d="M22 10.2c-1-.5-2.1-1-3.2-1.2m-13.6 0C4.1 9.2 3 9.7 2 10.2" />
      <path d="M17 6a4 4 0 0 0-4-4" />
      <path d="M7 6a4 4 0 0 1 4-4" />
    </svg>
  ),
};
