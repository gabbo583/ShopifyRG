import type { ReactNode } from "react"

type Props = {
  name: string
  size?: number
}

export default function ReferenceIcon({ name, size = 22 }: Props) {
  const paths: Record<string, ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l1 13H4L5 8Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    cart: (
      <>
        <path d="M2 3h3l3 13h11l3-10H6M8 19h.01M19 19h.01" />
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
      </>
    ),
    heart: (
      <path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 4 0 8 8 15 8-7 12-11 8-15Z" />
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="3.5" />
        <path d="M5 21v-3a7 7 0 0 1 14 0v3Z" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 6 6" />
      </>
    ),
    menu: <path d="M3 5h18M3 12h18M3 19h18" />,
    close: <path d="m5 5 14 14M5 19 19 5" />,
    arrow: <path d="m9 5 7 7-7 7" />,
    back: <path d="m15 5-7 7 7 7" />,
    minus: <path d="M5 12h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    trash: (
      <>
        <path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7" />
      </>
    ),
    shirt: <path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c-2 3-6 3-8 0Z" />,
    jacket: (
      <>
        <path d="m8 3-5 4 2 15h5V9h4v13h5l2-15-5-4-4 3-4-3Z" />
        <path d="m8 3 4 6 4-6M12 9v13" />
      </>
    ),
    accessories: (
      <>
        <path d="m6 8 6-4 6 4 3 9-9 5-9-5 3-9Z" />
        <path d="m6 8 6 4 6-4M12 12v10M8 4l4-3 4 3" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    truck: (
      <>
        <path d="M1 5h13v13H1M14 9h5l4 5v4h-9M1 9h6M1 13h4" />
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="19" r="3" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 9 4-1 8c-1 4-8 8-8 8s-7-4-8-8L3 6l9-4Z" />
        <path d="m8 12 3 3 5-7" />
      </>
    ),
    box: (
      <>
        <path d="m12 2 9 5v10l-9 5-9-5V7l9-5ZM3 7l9 5 9-5M12 12v10M7 4l10 6v5" />
      </>
    ),
    filter: (
      <>
        <path d="M3 6h18M3 12h18M3 18h18" />
        <path d="M7 4v4M16 10v4M10 16v4" />
      </>
    ),
    check: <path d="m4 12 5 5L20 5" />,
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  )
}
