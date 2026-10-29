import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { countRecipeSecrets } from '../lib/secrets'
import { formatCount } from '../lib/time'
import type { Recipe } from '../types'

type RecipeCardProps = {
  recipe: Recipe
  onRemove?: () => void
}

export function RecipeCard({ recipe, onRemove }: RecipeCardProps) {
  const secrets = countRecipeSecrets(recipe)

  return (
    <div className="group relative">
      <Link
        to={`/recipe/${recipe.id}`}
        className="block overflow-hidden rounded-2xl bg-black shadow-sm transition-transform active:scale-[0.98]"
      >
        <div className="relative aspect-[4/5]">
          <img
            src={recipe.image}
            alt={recipe.title}
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink backdrop-blur">
            {recipe.difficulty}
          </span>

          {secrets.total > 0 ? (
            <span
              aria-label={`${secrets.total} ${secrets.total === 1 ? 'secreto' : 'secretos'} en esta receta`}
              className="absolute left-2.5 top-9 flex items-center gap-0.5 rounded-full bg-purple-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur"
            >
              <Icon name="lock" className="text-[11px]" />
              {secrets.total}
            </span>
          ) : null}

          {recipe.savedByMe && !onRemove ? (
            <span className="absolute right-2.5 top-2.5 flex size-6 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur">
              <Icon name="bookmark" filled className="text-[13px]" />
            </span>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <p className="line-clamp-2 text-sm font-bold leading-tight">{recipe.title}</p>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-white/90">
              <Icon name="schedule" className="text-[13px]" />
              <span>{recipe.timeMinutes} min</span>
              <span className="mx-1">·</span>
              <Icon name="favorite" filled className="text-[13px]" />
              <span>{formatCount(recipe.likes)}</span>
            </div>
          </div>
        </div>
      </Link>

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${recipe.title} de guardadas`}
          title="Quitar de guardadas"
          className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/55 active:scale-90"
        >
          <Icon name="bookmark" filled className="text-[16px]" />
        </button>
      ) : null}
    </div>
  )
}
