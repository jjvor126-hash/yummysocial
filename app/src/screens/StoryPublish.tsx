import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { SegmentedControl } from '../components/SegmentedControl'
import { Toast } from '../components/Toast'
import { clearStoryDraft, loadStoryDraft, saveStoryDraft } from '../lib/storyDraft'
import type { StoryDraft } from '../lib/storyDraft'
import { useToast } from '../lib/useToast'
import { useAppStore, useCurrentUser } from '../store/useAppStore'

const SUGGESTED_TAGS = ['Vegano', 'SinGluten', 'Italiano', 'Picante', 'Postre', 'Rápido']

const fieldClass =
  'w-full rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500'

const labelTextClass = 'ml-1 text-sm font-semibold text-ink dark:text-gray-200'

function splitTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function StoryPublish() {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const addStory = useAppStore((state) => state.addStory)
  const [draft, setDraft] = useState<StoryDraft | null>(() => loadStoryDraft())
  const [tagInput, setTagInput] = useState('')
  const { message: toast, showToast } = useToast()

  useEffect(() => {
    if (!draft) return
    const timer = window.setTimeout(() => saveStoryDraft(draft), 300)
    return () => window.clearTimeout(timer)
  }, [draft])

  if (!draft || !draft.image) return <Navigate to="/stories/new" replace />

  const tags = splitTags(draft.tags)

  function update(patch: Partial<StoryDraft>) {
    setDraft((current) => (current ? { ...current, ...patch } : current))
  }

  function addTag(value: string) {
    if (!draft) return

    const clean = value.replace(/^#/, '').trim()
    if (!clean) return

    const exists = tags.some((tag) => tag.toLowerCase() === clean.toLowerCase())
    if (exists) {
      setTagInput('')
      return
    }

    if (tags.length >= 5) {
      showToast('Puedes añadir hasta 5 etiquetas')
      return
    }

    update({ tags: [...tags, clean].join(', ') })
    setTagInput('')
  }

  function removeTag(tag: string) {
    if (!draft) return
    update({ tags: tags.filter((item) => item !== tag).join(', ') })
  }

  function handlePublish() {
    if (!draft || !currentUser) return

    const id = addStory({
      image: draft.image,
      caption: draft.caption.trim().slice(0, 120),
      tags,
      overlayText: draft.overlayText.trim(),
      textColor: draft.textColor,
      stickers: draft.stickers,
      location: draft.location.trim(),
      durationHours: draft.durationHours,
      audience: draft.audience,
    })

    clearStoryDraft()
    navigate(`/stories/${currentUser.id}?s=${id}`, {
      replace: true,
      state: { from: '/feed', replaceFrom: true },
    })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-surface/90 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <button
          type="button"
          onClick={() => navigate('/stories/new/editor')}
          aria-label="Volver al editor"
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Icon name="arrow_back" />
        </button>
        <h1 className="flex-1 pr-10 text-center text-lg font-bold tracking-tight">
          Nueva historia
        </h1>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-4 pb-32 pt-5">
        <section className="flex flex-col items-center">
          <div className="relative aspect-[3/4] w-40 overflow-hidden rounded-2xl bg-black shadow-lg ring-4 ring-white dark:ring-white/10">
            <img src={draft.image} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {draft.overlayText ? (
              <p
                className="absolute inset-x-2 top-[36%] -rotate-3 text-center text-sm font-extrabold leading-tight drop-shadow"
                style={{ color: draft.textColor }}
              >
                {draft.overlayText}
              </p>
            ) : null}

            {draft.stickers[0] ? (
              <span className="absolute bottom-6 right-2 text-2xl drop-shadow" aria-hidden="true">
                {draft.stickers[0]}
              </span>
            ) : null}

            <span className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-medium text-white">
              <Icon name="restaurant" className="text-[12px]" />
              Vista previa
            </span>
          </div>
        </section>

        <section>
          <label className="flex flex-col gap-2">
            <span className={labelTextClass}>Descripción</span>
            <div className="relative">
              <textarea
                value={draft.caption}
                onChange={(event) =>
                  update({ caption: event.target.value.slice(0, 120) })
                }
                placeholder="Describe tu plato delicioso…"
                rows={3}
                maxLength={120}
                className={`${fieldClass} resize-none py-3 leading-relaxed`}
              />
              <span className="absolute bottom-3 right-3 text-[11px] text-muted dark:text-gray-500">
                {draft.caption.length}/120
              </span>
            </div>
          </label>
        </section>

        <section className="flex flex-col gap-3">
          <span className={labelTextClass}>Etiquetas</span>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
            <Icon name="tag" className="text-[18px] text-primary" />
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ',') {
                  event.preventDefault()
                  addTag(tagInput)
                }
              }}
              placeholder="Añadir etiqueta y pulsar Enter"
              aria-label="Añadir etiqueta"
              maxLength={20}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted/70 dark:text-white dark:placeholder:text-gray-500"
            />
            {tagInput.trim() ? (
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                aria-label="Añadir etiqueta"
                className="flex size-7 items-center justify-center rounded-full bg-primary text-white"
              >
                <Icon name="add" className="text-[16px]" />
              </button>
            ) : null}
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                >
                  #{tag}
                  <Icon name="close" className="text-[13px]" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {SUGGESTED_TAGS.filter(
              (tag) => !tags.some((item) => item.toLowerCase() === tag.toLowerCase()),
            ).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/15"
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <span className={labelTextClass}>Duración de la historia</span>
          <SegmentedControl
            label="Duración de la historia"
            value={String(draft.durationHours)}
            options={[
              { value: '12', label: '12 horas', icon: 'schedule' },
              { value: '24', label: '24 horas', icon: 'schedule' },
            ]}
            showIcons={false}
            onChange={(value) => update({ durationHours: value === '12' ? 12 : 24 })}
          />
        </section>

        <section className="flex flex-col gap-2">
          <span className={labelTextClass}>Audiencia</span>
          <div className="grid grid-cols-2 gap-3">
            <AudienceOption
              active={draft.audience === 'todos'}
              icon="public"
              title="Todos"
              caption="Público"
              onClick={() => update({ audience: 'todos' })}
            />
            <AudienceOption
              active={draft.audience === 'amigos'}
              icon="stars"
              title="Solo amigos"
              caption="Privado"
              onClick={() => update({ audience: 'amigos' })}
            />
          </div>
        </section>

        <section>
          <label className="flex flex-col gap-2">
            <span className={labelTextClass}>Ubicación (opcional)</span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-gray-500">
                <Icon name="location_on" className="text-[18px]" />
              </span>
              <input
                value={draft.location}
                onChange={(event) => update({ location: event.target.value })}
                placeholder="Ej. Ciudad de México"
                maxLength={40}
                className={`${fieldClass} h-12 pl-10`}
              />
            </div>
          </label>
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-line bg-surface/95 p-4 pb-safe backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/95">
        <button
          type="button"
          onClick={handlePublish}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-white shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
        >
          Publicar historia
          <Icon name="send" className="text-[20px]" />
        </button>
      </div>

      <Toast message={toast} />
    </div>
  )
}

function AudienceOption({
  active,
  icon,
  title,
  caption,
  onClick,
}: {
  active: boolean
  icon: string
  title: string
  caption: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 p-4 transition-colors ${
        active
          ? 'border-primary bg-primary/5 dark:bg-primary/10'
          : 'border-line bg-white hover:bg-black/[0.02] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
      }`}
    >
      <span
        className={`flex size-10 items-center justify-center rounded-full ${
          active ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
        }`}
      >
        <Icon name={icon} className="text-[22px]" />
      </span>
      <span className="text-sm font-bold">{title}</span>
      <span className="text-[11px] text-muted dark:text-gray-400">{caption}</span>
      {active ? (
        <Icon
          name="check_circle"
          filled
          className="absolute right-2 top-2 text-[18px] text-primary"
        />
      ) : null}
    </button>
  )
}
