import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Toast } from '../components/Toast'
import { clearStoryDraft, loadStoryDraft, saveStoryDraft } from '../lib/storyDraft'
import type { StoryDraft } from '../lib/storyDraft'
import { STORY_STICKER_POSITIONS } from '../lib/storyLayout'
import { useToast } from '../lib/useToast'

const COLORS = ['#ffffff', '#ffd7a8', '#ffb7b2', '#e2f0cb', '#b5ead7', '#c7ceea']
const STICKERS = ['🍝', '🌮', '🍰', '🥗', '🔥', '😋', '✨', '👨‍🍳', '❤️', '🥑']

type Snapshot = Pick<StoryDraft, 'overlayText' | 'textColor' | 'stickers'>

function snapshot(draft: StoryDraft): Snapshot {
  return {
    overlayText: draft.overlayText,
    textColor: draft.textColor,
    stickers: draft.stickers,
  }
}

export function StoryEditor() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<StoryDraft | null>(() => loadStoryDraft())
  const [history, setHistory] = useState<Snapshot[]>([])
  const [saveFailed, setSaveFailed] = useState(false)
  const { message: toast, showToast } = useToast()

  useEffect(() => {
    if (!draft) return
    const timer = window.setTimeout(() => {
      setSaveFailed(!saveStoryDraft(draft))
    }, 400)
    return () => window.clearTimeout(timer)
  }, [draft])

  if (!draft) return <Navigate to="/stories/new" replace />

  function update(patch: Partial<StoryDraft>, record = true) {
    if (!draft) return
    if (record) {
      setHistory((items) => [...items.slice(-9), snapshot(draft)])
    }
    setDraft({ ...draft, ...patch })
  }

  function pushHistory() {
    if (!draft) return
    setHistory((items) => [...items.slice(-9), snapshot(draft)])
  }

  function undo() {
    const previous = history[history.length - 1]
    if (!previous || !draft) return

    setDraft({ ...draft, ...previous })
    setHistory(history.slice(0, -1))
  }

  function toggleSticker(sticker: string) {
    if (!draft) return
    const exists = draft.stickers.includes(sticker)

    if (!exists && draft.stickers.length >= 6) {
      showToast('Máximo 6 stickers por historia')
      return
    }

    update({
      stickers: exists
        ? draft.stickers.filter((item) => item !== sticker)
        : [...draft.stickers, sticker],
    })
  }

  function removeSticker(index: number) {
    if (!draft) return
    update({ stickers: draft.stickers.filter((_, position) => position !== index) })
  }

  function handleClose() {
    if (draft) saveStoryDraft(draft)
    navigate('/stories/new')
  }

  function handleDiscard() {
    const confirmed = window.confirm(
      '¿Descartar esta historia? Se perderá el borrador guardado.',
    )
    if (!confirmed) return

    clearStoryDraft()
    navigate('/stories/new')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#16110d] text-white">
      <header className="flex items-center justify-between gap-2 px-4 py-4">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Volver al selector de fotos"
          className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          <Icon name="close" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-bold tracking-tight">Editar historia</h1>
          <p className="text-[11px] text-white/50">Texto, stickers y color</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={history.length === 0}
            aria-label="Deshacer"
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30"
          >
            <Icon name="undo" />
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            aria-label="Descartar historia"
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <Icon name="delete" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 pb-8">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-3xl bg-black shadow-2xl shadow-black/50">
          <img src={draft.image} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/65" />

          <div className="absolute inset-x-5 top-[32%] -rotate-3">
            <input
              value={draft.overlayText}
              onChange={(event) => update({ overlayText: event.target.value }, false)}
              onFocus={pushHistory}
              placeholder="Escribe algo…"
              aria-label="Texto de la historia"
              maxLength={60}
              className="w-full bg-transparent text-center text-3xl font-extrabold leading-tight outline-none placeholder:text-white/40"
              style={{
                color: draft.textColor,
                textShadow: '0 2px 10px rgba(0,0,0,0.55)',
              }}
            />
          </div>

          {draft.stickers.map((sticker, index) => (
            <button
              key={`${sticker}-${index}`}
              type="button"
              onClick={() => removeSticker(index)}
              aria-label={`Quitar sticker ${sticker}`}
              className="absolute flex size-14 items-center justify-center text-4xl drop-shadow-lg transition-transform active:scale-90"
              style={
                STORY_STICKER_POSITIONS[index] ?? STORY_STICKER_POSITIONS[0]
              }
            >
              <span aria-hidden="true">{sticker}</span>
            </button>
          ))}
        </div>

        <section>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-white/60">
            Color del texto
          </p>
          <div className="flex items-center gap-3 px-1">
            {COLORS.map((color) => {
              const active = draft.textColor === color
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => update({ textColor: color })}
                  aria-label={`Color ${color}`}
                  aria-pressed={active}
                  className={`size-8 rounded-full border-2 transition-transform active:scale-90 ${
                    active
                      ? 'border-white ring-2 ring-white/40'
                      : 'border-white/30 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              )
            })}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Stickers
            </p>
            <span className="text-[11px] text-white/40">{draft.stickers.length}/6</span>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {STICKERS.map((sticker) => {
              const active = draft.stickers.includes(sticker)
              return (
                <button
                  key={sticker}
                  type="button"
                  onClick={() => toggleSticker(sticker)}
                  aria-pressed={active}
                  aria-label={`Sticker ${sticker}`}
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border text-2xl transition-colors ${
                    active
                      ? 'border-primary bg-primary/20'
                      : 'border-white/10 bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <span aria-hidden="true">{sticker}</span>
                </button>
              )
            })}
          </div>
        </section>

        <p
          className={`px-1 text-center text-[11px] ${
            saveFailed ? 'text-red-400' : 'text-white/40'
          }`}
        >
          {saveFailed
            ? 'No se pudo guardar el borrador en este dispositivo'
            : 'El borrador se guarda automáticamente'}
        </p>
      </main>

      <div className="sticky bottom-0 border-t border-white/10 bg-[#16110d]/95 p-4 pb-safe backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/stories/new/publish')}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-white shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
        >
          Siguiente
          <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
            <Icon name="arrow_forward" className="text-[16px]" />
          </span>
        </button>
      </div>

      <Toast message={toast} />
    </div>
  )
}
