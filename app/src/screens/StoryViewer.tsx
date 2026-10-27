import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { StoryProgress } from '../components/StoryProgress'
import { Toast } from '../components/Toast'
import {
  groupStoriesByAuthor,
  storiesForAuthor,
  storyDurationMs,
  storyTimeLeft,
} from '../lib/stories'
import { STORY_STICKER_POSITIONS } from '../lib/storyLayout'
import { timeAgo } from '../lib/time'
import { useToast } from '../lib/useToast'
import { useAppStore, useCurrentUser } from '../store/useAppStore'

const HIGHLIGHT_SUGGESTIONS = ['Pasta', 'Ensaladas', 'Postres', 'Tips', 'Cocina']

type Sheet = 'none' | 'menu' | 'highlight'

export function StoryViewer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userId } = useParams()
  const [searchParams] = useSearchParams()

  const stories = useAppStore((state) => state.stories)
  const users = useAppStore((state) => state.users)
  const highlights = useAppStore((state) => state.highlights)
  const markStoryViewed = useAppStore((state) => state.markStoryViewed)
  const deleteStory = useAppStore((state) => state.deleteStory)
  const addHighlight = useAppStore((state) => state.addHighlight)
  const removeHighlight = useAppStore((state) => state.removeHighlight)
  const currentUser = useCurrentUser()
  const { message: toast, showToast } = useToast()

  const groups = useMemo(
    () => groupStoriesByAuthor(stories, users, currentUser, []),
    [stories, users, currentUser],
  )
  const list = useMemo(
    () => storiesForAuthor(stories, userId, currentUser),
    [stories, userId, currentUser],
  )

  const requestedId = searchParams.get('s')
  const [index, setIndex] = useState(() => {
    const found = list.findIndex((story) => story.id === requestedId)
    return found >= 0 ? found : 0
  })
  const [elapsed, setElapsed] = useState(0)
  const [holding, setHolding] = useState(false)
  const [sheet, setSheet] = useState<Sheet>('none')
  const [label, setLabel] = useState('')

  const startY = useRef(0)
  const swipeRef = useRef(false)

  const from = (location.state as { from?: string } | null)?.from
  const replaceFrom = Boolean(
    (location.state as { replaceFrom?: boolean } | null)?.replaceFrom,
  )
  const story = list[Math.min(index, Math.max(list.length - 1, 0))]
  const author = story ? users.find((user) => user.id === story.authorId) : undefined
  const duration = story ? storyDurationMs(story) : 5_000
  const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 0
  const isMine = Boolean(story && currentUser && story.authorId === currentUser.id)
  const highlight = story
    ? highlights.find(
        (item) => item.userId === currentUser?.id && item.storyId === story.id,
      )
    : undefined

  useEffect(() => {
    const found = requestedId ? list.findIndex((item) => item.id === requestedId) : -1
    setIndex(found >= 0 ? found : 0)
    setElapsed(0)
    setSheet('none')
    // Only reset when the author or the requested story changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, requestedId])

  useEffect(() => {
    if (!story) return
    markStoryViewed(story.id)
  }, [story, markStoryViewed])

  useEffect(() => {
    if (!story || holding || sheet !== 'none') return
    const step = 50
    const timer = window.setInterval(() => {
      setElapsed((value) => Math.min(value + step, duration))
    }, step)
    return () => window.clearInterval(timer)
  }, [story, holding, sheet, duration])

  useEffect(() => {
    if (!story || elapsed < duration) return
    next()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, duration])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
      else if (event.key === 'ArrowRight') next()
      else if (event.key === 'ArrowLeft') previous()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  function close() {
    if (replaceFrom) {
      navigate(from ?? '/feed', { replace: true })
      return
    }

    const historyIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (historyIndex > 0) {
      navigate(-1)
      return
    }

    navigate(from ?? '/feed', { replace: true })
  }

  function next() {
    if (index < list.length - 1) {
      setIndex(index + 1)
      setElapsed(0)
      return
    }

    const position = groups.findIndex((group) => group.author.id === userId)
    const nextGroup = position >= 0 ? groups[position + 1] : undefined

    if (nextGroup) {
      navigate(`/stories/${nextGroup.author.id}`, {
        replace: true,
        state: location.state,
      })
      return
    }

    close()
  }

  function previous() {
    if (index > 0) {
      setIndex(index - 1)
      setElapsed(0)
      return
    }

    const position = groups.findIndex((group) => group.author.id === userId)
    const previousGroup = position > 0 ? groups[position - 1] : undefined

    if (previousGroup) {
      const last = previousGroup.stories[previousGroup.stories.length - 1]
      navigate(`/stories/${previousGroup.author.id}?s=${last.id}`, {
        replace: true,
        state: location.state,
      })
      return
    }

    setElapsed(0)
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    startY.current = event.clientY
    swipeRef.current = false
    setHolding(true)
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    setHolding(false)
    if (event.clientY - startY.current > 100) {
      swipeRef.current = true
      close()
    }
  }

  function tap(action: () => void) {
    if (swipeRef.current) {
      swipeRef.current = false
      return
    }
    action()
  }

  function openHighlightForm() {
    setLabel(highlight?.label ?? '')
    setSheet('highlight')
  }

  function saveHighlight() {
    if (!story || !label.trim()) return
    addHighlight(story.id, label)
    setSheet('none')
    showToast('Añadido a historias destacadas')
  }

  function handleDelete() {
    if (!story) return
    const confirmed = window.confirm('¿Eliminar esta historia? No se puede deshacer.')
    if (!confirmed) return

    deleteStory(story.id)
    close()
  }

  if (!story || !author) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center bg-black">
        <div className="relative flex h-dvh w-full max-w-md flex-col items-center justify-center gap-3 px-8 text-center text-white">
          <span className="flex size-16 items-center justify-center rounded-full bg-white/10">
            <Icon name="auto_stories" className="text-[32px]" />
          </span>
          <p className="text-lg font-bold">Esta historia ya no está disponible</p>
          <p className="text-sm text-white/60">
            Puede que haya caducado o que ya no tengas acceso a ella.
          </p>
          <button
            type="button"
            onClick={close}
            className="mt-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-ink"
          >
            Volver
          </button>
          <Toast message={toast} />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black">
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-black text-white">
        <img
          src={story.image}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/75 via-black/10 to-black/85" />

        {story.overlayText ? (
          <p
            className="pointer-events-none absolute inset-x-8 top-[34%] z-10 -rotate-3 text-center text-3xl font-extrabold leading-tight drop-shadow-lg"
            style={{ color: story.textColor, textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}
          >
            {story.overlayText}
          </p>
        ) : null}

        {story.stickers.map((sticker, position) => (
          <span
            key={`${sticker}-${position}`}
            aria-hidden="true"
            className="pointer-events-none absolute z-10 text-4xl drop-shadow-lg"
            style={
              STORY_STICKER_POSITIONS[position] ?? STORY_STICKER_POSITIONS[0]
            }
          >
            {sticker}
          </span>
        ))}

        <div className="relative z-20 flex h-full flex-col">
          <div className="px-3 pt-4">
            <StoryProgress count={list.length} activeIndex={index} progress={progress} />

            <div className="mt-3 flex items-center gap-3">
              <img
                src={author.avatar}
                alt=""
                className="size-9 rounded-full object-cover ring-2 ring-white/40"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{author.name}</p>
                <p className="truncate text-[11px] text-white/70">
                  {timeAgo(story.createdAt)} · {storyTimeLeft(story)}
                </p>
              </div>
              {isMine ? (
                <button
                  type="button"
                  onClick={() => setSheet('menu')}
                  aria-label="Opciones de la historia"
                  className="flex size-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur transition-colors hover:bg-black/40"
                >
                  <Icon name="more_horiz" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar historia"
                className="flex size-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur transition-colors hover:bg-black/40"
              >
                <Icon name="close" />
              </button>
            </div>
          </div>

          <div
            className="relative flex-1 touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => setHolding(false)}
          >
            <button
              type="button"
              onClick={() => tap(previous)}
              aria-label="Historia anterior"
              className="absolute inset-y-0 left-0 z-10 w-1/3"
            />
            <button
              type="button"
              onClick={() => tap(next)}
              aria-label="Siguiente historia"
              className="absolute inset-y-0 right-0 z-10 w-2/3"
            />
          </div>

          <div className="space-y-2 px-5 pb-7">
            {story.caption ? (
              <p className="text-sm leading-snug text-white/95">{story.caption}</p>
            ) : null}

            {story.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {story.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            {story.location ? (
              <p className="flex items-center gap-1 text-[11px] font-medium text-white/75">
                <Icon name="location_on" className="text-[14px]" />
                {story.location}
              </p>
            ) : null}
          </div>
        </div>

        {sheet !== 'none' ? (
          <div
            className="absolute inset-0 z-30 flex items-end bg-black/60"
            onClick={() => setSheet('none')}
          >
            <div
              className="w-full rounded-t-3xl bg-white p-5 pb-safe text-ink shadow-2xl dark:bg-surface-dark dark:text-white"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-label="Opciones de la historia"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line dark:bg-white/20" />

              {sheet === 'menu' ? (
                <div className="flex flex-col gap-1">
                  <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted dark:text-gray-400">
                    Tu historia
                  </p>
                  <button
                    type="button"
                    onClick={openHighlightForm}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Icon name="star" className="text-[20px] text-primary" />
                    {highlight ? 'Cambiar destacado' : 'Añadir a destacados'}
                  </button>
                  {highlight ? (
                    <button
                      type="button"
                      onClick={() => {
                        removeHighlight(highlight.id)
                        setSheet('none')
                        showToast('Quitado de destacados')
                      }}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Icon name="star_half" className="text-[20px] text-muted" />
                      Quitar de destacados
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Icon name="delete" className="text-[20px]" />
                    Eliminar historia
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheet('none')}
                    className="mt-1 rounded-xl bg-surface px-3 py-3 text-center text-sm font-bold dark:bg-white/10"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-base font-bold">Nuevo destacado</h2>
                    <p className="text-xs text-muted dark:text-gray-400">
                      Elige un nombre para agrupar esta historia en tu perfil.
                    </p>
                  </div>

                  <label className="flex flex-col gap-2">
                    <span className="ml-1 text-xs font-semibold">Nombre</span>
                    <input
                      value={label}
                      onChange={(event) => setLabel(event.target.value.slice(0, 18))}
                      placeholder="Ej. Postres"
                      maxLength={18}
                      autoFocus
                      className="h-12 w-full rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {HIGHLIGHT_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setLabel(suggestion)}
                        className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSheet('menu')}
                      className="flex h-11 flex-1 items-center justify-center rounded-full bg-surface text-sm font-bold dark:bg-white/10"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={saveHighlight}
                      disabled={!label.trim()}
                      className="flex h-11 flex-[1.4] items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-50"
                    >
                      Guardar destacado
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <Toast message={toast} />
      </div>
    </div>
  )
}
