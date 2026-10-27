import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Toast } from '../components/Toast'
import { useToast } from '../lib/useToast'
import { clearDraft, loadDraft, saveDraft } from '../lib/draft'
import type { DraftIngredient, DraftStep } from '../lib/draft'
import { readImageFile } from '../lib/image'
import { useAppStore } from '../store/useAppStore'
import type { Difficulty } from '../types'

const DIFFICULTIES: Difficulty[] = ['Fácil', 'Media', 'Difícil']

const EXAMPLE_IMAGES = [
  '/img/feed-principal-de-recetas-02.jpg',
  '/img/feed-principal-de-recetas-06.jpg',
  '/img/feed-principal-de-recetas-08.jpg',
  '/img/platos-m-s-estrellados-02.jpg',
]

const FALLBACK_IMAGE = '/img/feed-principal-de-recetas-06.jpg'

const fieldClass =
  'w-full rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500'

const labelTextClass = 'ml-1 text-sm font-semibold text-ink dark:text-gray-200'

const rowFieldClass =
  'h-10 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-1 focus:ring-primary/30 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-gray-500'

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

function blankIngredient(secret = false): DraftIngredient {
  return { id: makeId(), amount: '', name: '', secret }
}

function blankStep(secret = false): DraftStep {
  return { id: makeId(), text: '', secret }
}

export function CreateRecipe() {
  const navigate = useNavigate()
  const addRecipe = useAppStore((state) => state.addRecipe)
  const { message: toast, showToast } = useToast()

  const [initialDraft] = useState(() => loadDraft())
  const [hasDraft, setHasDraft] = useState(Boolean(initialDraft))

  const [title, setTitle] = useState(initialDraft?.title ?? '')
  const [description, setDescription] = useState(initialDraft?.description ?? '')
  const [image, setImage] = useState(initialDraft?.image ?? '')
  const [timeMinutes, setTimeMinutes] = useState(initialDraft?.timeMinutes ?? '30')
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDraft?.difficulty ?? 'Fácil')
  const [servings, setServings] = useState(initialDraft?.servings ?? '2')
  const [calories, setCalories] = useState(initialDraft?.calories ?? '')
  const [tags, setTags] = useState(initialDraft?.tags ?? '')
  const [ingredients, setIngredients] = useState<DraftIngredient[]>(() =>
    initialDraft && initialDraft.ingredients.length > 0
      ? initialDraft.ingredients
      : [blankIngredient()],
  )
  const [steps, setSteps] = useState<DraftStep[]>(() =>
    initialDraft && initialDraft.steps.length > 0 ? initialDraft.steps : [blankStep()],
  )
  const [error, setError] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function fail(message: string) {
    setError(message)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setReading(true)
    try {
      setImage(await readImageFile(file))
      setError(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo cargar la imagen.')
    } finally {
      setReading(false)
    }
  }

  function updateIngredient(id: string, patch: Partial<DraftIngredient>) {
    setIngredients((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )
  }

  function addIngredient(secret = false) {
    setIngredients((items) => [...items, blankIngredient(secret)])
    setError(null)
  }

  function removeIngredient(id: string) {
    setIngredients((items) =>
      items.length > 1 ? items.filter((item) => item.id !== id) : [blankIngredient()],
    )
  }

  function updateStep(id: string, patch: Partial<DraftStep>) {
    setSteps((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function addStep(secret = false) {
    setSteps((items) => [...items, blankStep(secret)])
    setError(null)
  }

  function removeStep(id: string) {
    setSteps((items) =>
      items.length > 1 ? items.filter((item) => item.id !== id) : [blankStep()],
    )
  }

  function handleSaveDraft() {
    const saved = saveDraft({
      title,
      description,
      image,
      timeMinutes,
      difficulty,
      servings,
      calories,
      tags,
      ingredients,
      steps,
    })

    if (saved) {
      setHasDraft(true)
      showToast('Borrador guardado')
      return
    }

    showToast('No se pudo guardar el borrador')
  }

  function handleDiscardDraft() {
    clearDraft()
    setTitle('')
    setDescription('')
    setImage('')
    setTimeMinutes('30')
    setDifficulty('Fácil')
    setServings('2')
    setCalories('')
    setTags('')
    setIngredients([blankIngredient()])
    setSteps([blankStep()])
    setError(null)
    setHasDraft(false)
    showToast('Borrador descartado')
  }

  function handlePublish(event: FormEvent) {
    event.preventDefault()

    const cleanTitle = title.trim()
    const cleanDescription = description.trim()
    const cleanIngredients = ingredients
      .map((item) => ({
        amount: item.amount.trim(),
        name: item.name.trim(),
        secret: item.secret || undefined,
      }))
      .filter((item) => item.name)
    const cleanSteps = steps
      .map((step) => ({ text: step.text.trim(), secret: step.secret || undefined }))
      .filter((step) => step.text)

    if (!cleanTitle) {
      fail('Añade un título para tu receta.')
      return
    }

    if (!cleanDescription) {
      fail('Cuéntanos algo sobre tu receta en la descripción.')
      return
    }

    if (cleanIngredients.length === 0) {
      fail('Añade al menos un ingrediente.')
      return
    }

    if (cleanSteps.length === 0) {
      fail('Añade al menos un paso de preparación.')
      return
    }

    const cleanTags = Array.from(
      new Set(
        tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ).slice(0, 4)

    const id = addRecipe({
      title: cleanTitle,
      description: cleanDescription,
      image: image || FALLBACK_IMAGE,
      timeMinutes: Math.max(1, Number.parseInt(timeMinutes, 10) || 30),
      difficulty,
      servings: Math.max(1, Number.parseInt(servings, 10) || 1),
      calories: Math.max(0, Number.parseInt(calories, 10) || 0),
      tags: cleanTags,
      ingredients: cleanIngredients,
      steps: cleanSteps,
    })

    clearDraft()
    navigate(`/recipe/${id}`, { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line bg-surface/90 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <button
          type="button"
          onClick={() => navigate('/feed')}
          aria-label="Cerrar"
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Icon name="close" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold tracking-tight">Crear receta</h1>
        <button
          type="button"
          onClick={handleSaveDraft}
          className="flex h-10 shrink-0 items-center justify-center rounded-full px-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
        >
          Guardar
        </button>
      </header>

      <form
        id="create-recipe"
        onSubmit={handlePublish}
        className="flex flex-col gap-5 px-4 pb-32 pt-3"
      >
        {hasDraft ? (
          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary-soft px-3 py-2 text-xs font-medium text-primary dark:border-primary/30 dark:bg-primary/10">
            <Icon name="history" className="text-[16px]" />
            <span className="flex-1">Borrador guardado en este dispositivo</span>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="font-bold underline underline-offset-2"
            >
              Descartar
            </button>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
          >
            <Icon name="error" className="text-[16px]" />
            {error}
          </p>
        ) : null}

        <section>
          {image ? (
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={image}
                alt="Portada de la receta"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink backdrop-blur"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-bold text-white backdrop-blur"
                >
                  Quitar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-white/60 text-center shadow-inner transition-colors hover:border-primary/50 dark:border-white/10 dark:bg-white/5"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-white text-primary shadow-sm dark:bg-surface-dark">
                <Icon name="add_a_photo" className="text-[28px]" />
              </span>
              <span className="text-sm font-semibold">Foto de portada</span>
              <span className="text-xs text-muted dark:text-gray-400">
                Toca para subir una imagen
              </span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />

          {reading ? (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
              <Icon name="sync" className="animate-spin text-[14px]" />
              Procesando imagen…
            </p>
          ) : null}

          {!image ? (
            <div className="mt-3">
              <p className="mb-2 text-xs font-semibold text-muted dark:text-gray-400">
                O elige una foto de ejemplo
              </p>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {EXAMPLE_IMAGES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setImage(option)}
                    aria-label="Usar foto de ejemplo"
                    className="size-16 shrink-0 overflow-hidden rounded-xl border-2 border-transparent transition-transform active:scale-95"
                  >
                    <img src={option} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className={labelTextClass}>Título de la receta</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Pasta carbonara"
              className={`${fieldClass} h-14 text-lg font-semibold`}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelTextClass}>Descripción breve</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Cuéntanos la historia de este plato, tips secretos o por qué te encanta…"
              rows={4}
              className={`${fieldClass} resize-none py-3 leading-relaxed`}
            />
          </label>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2">
            <span className={labelTextClass}>Tiempo (min)</span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-gray-500">
                <Icon name="schedule" className="text-[18px]" />
              </span>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={timeMinutes}
                onChange={(event) => setTimeMinutes(event.target.value)}
                className={`${fieldClass} h-12 pl-10`}
              />
            </div>
          </label>

          <div className="flex flex-col gap-2">
            <span className={labelTextClass}>Dificultad</span>
            <div className="flex h-12 items-center rounded-xl border border-line bg-white p-1 dark:border-white/10 dark:bg-white/5">
              {DIFFICULTIES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDifficulty(option)}
                  aria-pressed={difficulty === option}
                  className={`h-full flex-1 rounded-lg text-xs font-bold transition-colors ${
                    difficulty === option
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2">
            <span className={labelTextClass}>Porciones</span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-gray-500">
                <Icon name="group" className="text-[18px]" />
              </span>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={servings}
                onChange={(event) => setServings(event.target.value)}
                className={`${fieldClass} h-12 pl-10`}
              />
            </div>
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelTextClass}>Calorías</span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-gray-500">
                <Icon name="local_fire_department" className="text-[18px]" />
              </span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={calories}
                onChange={(event) => setCalories(event.target.value)}
                placeholder="Opcional"
                className={`${fieldClass} h-12 pl-10`}
              />
            </div>
          </label>
        </section>

        <label className="flex flex-col gap-2">
          <span className={labelTextClass}>Etiquetas</span>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Postres, Cocina italiana, Rápido"
            className={`${fieldClass} h-12`}
          />
          <span className="ml-1 text-[11px] text-muted dark:text-gray-500">
            Separa las etiquetas con comas. Se guardan las primeras 4.
          </span>
        </label>

        <hr className="border-line dark:border-white/10" />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Ingredientes</h2>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
              {ingredients.length} {ingredients.length === 1 ? 'ítem' : 'ítems'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className={`rounded-2xl border p-2 transition-colors ${
                  ingredient.secret
                    ? 'border-purple-200 bg-purple-50 dark:border-purple-500/20 dark:bg-purple-500/10'
                    : 'border-line bg-white dark:border-white/10 dark:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center ${
                      ingredient.secret ? 'text-purple-500' : 'text-muted/50 dark:text-gray-600'
                    }`}
                  >
                    <Icon
                      name={ingredient.secret ? 'lock' : 'drag_indicator'}
                      filled={ingredient.secret}
                      className="text-[18px]"
                    />
                  </span>

                  <input
                    value={ingredient.amount}
                    onChange={(event) =>
                      updateIngredient(ingredient.id, { amount: event.target.value })
                    }
                    placeholder="Cant."
                    aria-label="Cantidad"
                    className={`${rowFieldClass} w-16 shrink-0 px-2`}
                  />

                  <input
                    value={ingredient.name}
                    onChange={(event) =>
                      updateIngredient(ingredient.id, { name: event.target.value })
                    }
                    placeholder="Ingrediente"
                    aria-label="Ingrediente"
                    className={`${rowFieldClass} min-w-0 flex-1`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updateIngredient(ingredient.id, { secret: !ingredient.secret })
                    }
                    aria-label={
                      ingredient.secret ? 'Quitar ingrediente secreto' : 'Marcar como secreto'
                    }
                    aria-pressed={ingredient.secret}
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                      ingredient.secret
                        ? 'bg-purple-500 text-white shadow-sm shadow-purple-200 dark:shadow-none'
                        : 'text-muted hover:bg-purple-50 hover:text-purple-500 dark:text-gray-400 dark:hover:bg-purple-500/10'
                    }`}
                  >
                    <Icon
                      name={ingredient.secret ? 'lock' : 'lock_open'}
                      filled={ingredient.secret}
                      className="text-[18px]"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeIngredient(ingredient.id)}
                    aria-label="Eliminar ingrediente"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              onClick={() => addIngredient()}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
            >
              <Icon name="add_circle" className="text-[20px]" />
              Ingrediente
            </button>
            <button
              type="button"
              onClick={() => addIngredient(true)}
              aria-label="Añadir ingrediente secreto"
              className="flex items-center justify-center rounded-xl border border-dashed border-purple-300 bg-purple-50 px-4 py-3 text-purple-600 transition-colors hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20"
            >
              <Icon name="lock" className="text-[20px]" />
            </button>
          </div>
        </section>

        <hr className="border-line dark:border-white/10" />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Pasos de preparación</h2>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
              {steps.length} {steps.length === 1 ? 'paso' : 'pasos'}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex gap-3 ${
                  step.secret
                    ? 'rounded-2xl border border-purple-200 bg-purple-50 p-2.5 dark:border-purple-500/20 dark:bg-purple-500/10'
                    : ''
                }`}
              >
                <div className="flex flex-col items-center gap-1 pt-0.5">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      step.secret
                        ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                        : 'bg-primary text-white shadow-md shadow-primary/20'
                    }`}
                  >
                    {step.secret ? <Icon name="lock" className="text-[16px]" /> : index + 1}
                  </div>
                  {index < steps.length - 1 ? (
                    <div className="my-1 w-0.5 flex-1 rounded-full bg-line dark:bg-white/10" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 pb-1">
                  <div className="relative">
                    <textarea
                      value={step.text}
                      onChange={(event) => updateStep(step.id, { text: event.target.value })}
                      placeholder={
                        step.secret ? 'Escribe aquí el paso secreto…' : 'Describe el paso…'
                      }
                      aria-label={`Paso ${index + 1}`}
                      rows={3}
                      className={`w-full resize-none rounded-xl border p-3 text-sm font-medium leading-relaxed outline-none transition-colors ${
                        step.secret
                          ? 'border-purple-200 bg-white placeholder:text-purple-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:border-purple-500/30 dark:bg-white/5 dark:placeholder:text-purple-400/60'
                          : 'border-line bg-white placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-gray-500'
                      }`}
                    />
                    {step.secret ? (
                      <span className="absolute bottom-2 right-2 rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:bg-purple-900/40 dark:text-purple-200">
                        Secreto
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-1.5 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => updateStep(step.id, { secret: !step.secret })}
                      aria-label={step.secret ? 'Quitar paso secreto' : 'Marcar paso como secreto'}
                      aria-pressed={step.secret}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                        step.secret
                          ? 'bg-purple-500 text-white'
                          : 'bg-surface text-muted hover:text-purple-500 dark:bg-white/5 dark:text-gray-400'
                      }`}
                    >
                      <Icon
                        name={step.secret ? 'lock' : 'lock_open'}
                        filled={step.secret}
                        className="text-[13px]"
                      />
                      {step.secret ? 'Secreto' : 'Marcar secreto'}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      aria-label="Eliminar paso"
                      className="flex size-8 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Icon name="delete" className="text-[17px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              onClick={() => addStep()}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white/60 py-3 text-sm font-bold text-ink transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
            >
              <Icon name="add" className="text-[20px]" />
              Agregar paso
            </button>
            <button
              type="button"
              onClick={() => addStep(true)}
              aria-label="Añadir paso secreto"
              className="flex items-center justify-center rounded-xl border border-dashed border-purple-300 bg-purple-50 px-4 py-3 text-purple-600 transition-colors hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20"
            >
              <Icon name="lock" className="text-[20px]" />
            </button>
          </div>
        </section>
      </form>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-line bg-surface/95 p-4 pb-safe backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/95">
        <button
          type="submit"
          form="create-recipe"
          disabled={reading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-white shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-60"
        >
          Publicar receta
          <Icon name="check_circle" filled className="text-[20px]" />
        </button>
      </div>

      <Toast message={toast} />
    </div>
  )
}
