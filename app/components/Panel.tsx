import type { ReactNode } from "react"

type PanelProps = {
  children?: ReactNode
  color: React.CSSProperties['backgroundColor']
}

export default function Panel({ children, color }: PanelProps) {
  return <div
    className="flex flex-col items-center rounded-2xl p-4 gap-6 w-full"
    style={{
      backgroundColor: color
    }}
  >
    {children}
  </div>
}
