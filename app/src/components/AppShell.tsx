import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-[#e8e3de] dark:bg-black">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-surface shadow-[0_0_60px_rgba(0,0,0,0.15)] dark:bg-surface-dark">
        {children}
      </div>
    </div>
  )
}
