import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useAppStore } from '../store/useAppStore'

type Slide = {
  image: string
  alt: string
  icon: string
  title: string
  description: string
}

const slides: Slide[] = [
  {
    image: '/img/onboarding-para-nuevos-usuarios-1-01.jpg',
    alt: 'Ensalada colorida con ingredientes frescos vista desde arriba',
    icon: 'search',
    title: 'Descubre tu próxima cena',
    description:
      'Explora miles de recetas deliciosas perfectas para cualquier ocasión especial o diaria.',
  },
  {
    image: '/img/onboarding-para-nuevos-usuarios-1-02.jpg',
    alt: 'Persona fotografiando un plato con el móvil',
    icon: 'add_a_photo',
    title: 'Comparte tu talento',
    description:
      'Sube tus propias creaciones, inspira a otros y guarda tus recetas favoritas en tu perfil.',
  },
  {
    image: '/img/onboarding-para-nuevos-usuarios-1-03.jpg',
    alt: 'Amigos brindando con copas durante una cena',
    icon: 'favorite',
    title: 'Conecta con foodies',
    description:
      'Comenta, da like y sigue a cocineros apasionados que te inspiren cada día.',
  },
  {
    image: '/img/onboarding-para-nuevos-usuarios-1-04.jpg',
    alt: 'Chef emplatando un plato con precisión en la cocina',
    icon: 'military_tech',
    title: 'Desbloquea logros',
    description:
      'Gana insignias exclusivas mientras cocinas y te conviertes en un verdadero Master Chef.',
  },
]

export function Onboarding() {
  const navigate = useNavigate()
  const completeOnboarding = useAppStore((state) => state.completeOnboarding)
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const isLast = index === slides.length - 1

  function goTo(nextIndex: number) {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: nextIndex * track.clientWidth, behavior: 'smooth' })
    setIndex(nextIndex)
  }

  function finish() {
    completeOnboarding()
    navigate('/feed', { replace: true })
  }

  function handleNext() {
    if (isLast) {
      finish()
    } else {
      goTo(index + 1)
    }
  }

  function handleScroll() {
    const track = trackRef.current
    if (!track) return
    const next = Math.round(track.scrollLeft / track.clientWidth)
    if (next !== index && next >= 0 && next < slides.length) {
      setIndex(next)
    }
  }

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-white dark:bg-surface-dark">
      <div className="flex shrink-0 items-center justify-end px-5 pb-2 pt-5">
        <button
          type="button"
          onClick={finish}
          className="rounded-lg px-2 py-2 text-sm font-bold tracking-wide text-muted transition-colors hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10"
        >
          Omitir
        </button>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {slides.map((slide) => (
          <section
            key={slide.title}
            aria-label={slide.title}
            className="flex min-w-full snap-center flex-col items-center justify-start gap-6 px-6 pt-2"
          >
            <div className="relative aspect-[4/5] max-h-[46vh] w-full overflow-hidden rounded-3xl bg-primary-soft shadow-lg dark:bg-[#2f251d]">
              <img src={slide.image} alt={slide.alt} className="h-full w-full object-cover" />
            </div>

            <div className="flex max-w-xs flex-col items-center text-center">
              <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon name={slide.icon} className="text-[26px]" />
              </span>
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight">
                {slide.title}
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted dark:text-gray-400">
                {slide.description}
              </p>
            </div>
          </section>
        ))}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-6 px-6 pb-8 pt-4">
        <div className="flex items-center justify-center gap-2">
          {slides.map((slide, dotIndex) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Ir al paso ${dotIndex + 1}`}
              aria-current={dotIndex === index}
              onClick={() => goTo(dotIndex)}
              className={`h-2 rounded-full transition-all duration-300 ${
                dotIndex === index
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-[#e5e0dc] hover:bg-primary/40 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="flex h-14 w-full items-center justify-center rounded-full bg-primary px-8 text-lg font-bold text-white shadow-[0_4px_14px_0_rgba(233,166,99,0.39)] transition-transform active:scale-[0.98]"
        >
          {isLast ? 'Empezar a cocinar' : 'Siguiente'}
          <Icon name="arrow_forward" className="ml-2 text-xl" />
        </button>
      </div>
    </div>
  )
}
