type StoryProgressProps = {
  count: number
  activeIndex: number
  progress: number
}

export function StoryProgress({ count, activeIndex, progress }: StoryProgressProps) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => {
        const width =
          index < activeIndex ? 100 : index === activeIndex ? Math.min(progress, 1) * 100 : 0

        return (
          <span
            key={index}
            className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30"
          >
            <span
              className="block h-full rounded-full bg-white"
              style={{ width: `${width}%` }}
            />
          </span>
        )
      })}
    </div>
  )
}
