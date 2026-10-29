export function Toast({
  message,
  className = '',
}: {
  message: string | null
  className?: string
}) {
  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-24 left-1/2 z-50 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-center text-xs font-semibold text-white shadow-lg dark:bg-white dark:text-ink ${className}`}
    >
      {message}
    </div>
  )
}
