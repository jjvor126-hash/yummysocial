import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'

const stories = [
  { name: 'Tu historia', image: '/img/tabla-de-clasificaci-n-chefs-1-08.jpg', mine: true },
  { name: 'Chef María', image: '/img/feed-principal-de-recetas-05.jpg' },
  { name: 'ItalianHomeCook', image: '/img/feed-principal-de-recetas-07.jpg' },
  { name: 'FastFoodie', image: '/img/feed-principal-de-recetas-09.jpg' },
  { name: 'Laura M.', image: '/img/mi-perfil-con-historias-01.jpg' },
  { name: 'Chef Diego', image: '/img/tabla-de-clasificaci-n-chefs-1-02.jpg' },
]

const posts = [
  {
    id: 'pollo-albahaca',
    author: 'Chef María',
    handle: 'chefmaria',
    avatar: '/img/feed-principal-de-recetas-05.jpg',
    image: '/img/feed-principal-de-recetas-06.jpg',
    alt: 'Pollo picante con albahaca y arroz',
    caption: 'Pollo picante con albahaca: mi receta de la semana. El secreto está en la salsa.',
    likes: '1.248',
    comments: 84,
    time: 'Hace 2 h',
    difficulty: 'Fácil',
  },
  {
    id: 'risotto-setas',
    author: 'ItalianHomeCook',
    handle: 'italianhomecook',
    avatar: '/img/feed-principal-de-recetas-07.jpg',
    image: '/img/feed-principal-de-recetas-08.jpg',
    alt: 'Risotto cremoso de setas en un bol',
    caption: 'Risotto de setas sin prisa: remueve, añade caldo y espera la magia.',
    likes: '986',
    comments: 32,
    time: 'Hace 4 h',
    difficulty: 'Media',
  },
  {
    id: 'tacos-15-min',
    author: 'FastFoodie',
    handle: 'fastfoodie',
    avatar: '/img/feed-principal-de-recetas-09.jpg',
    image: '/img/feed-principal-de-recetas-10.jpg',
    alt: 'Tacos con lima en una tabla de madera',
    caption: 'Tacos en 15 minutos para cuando el hambre no espera.',
    likes: '2.105',
    comments: 120,
    time: 'Hace 6 h',
    difficulty: 'Fácil',
  },
]

export function Feed() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md dark:border-white/10 dark:bg-surface-dark/90">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/feed" className="flex items-center gap-2" aria-label="YummySocial, inicio">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
              <Icon name="lunch_dining" className="text-[20px]" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              Yummy<span className="text-primary">Social</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <IconButton to="/search" icon="search" label="Buscar recetas" />
            <IconButton to="/notifications" icon="notifications" label="Notificaciones" badge />
          </div>
        </div>
      </header>

      <section aria-label="Historias" className="border-b border-line px-4 py-3 dark:border-white/10">
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
          {stories.map((story) => (
            <button
              key={story.name}
              type="button"
              className="flex w-[68px] shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={
                  story.mine
                    ? 'rounded-full border-2 border-dashed border-primary p-[3px]'
                    : 'rounded-full bg-linear-to-tr from-primary via-orange-300 to-yellow-200 p-[2px]'
                }
              >
                <span className="block rounded-full bg-surface p-[2px] dark:bg-surface-dark">
                  <img
                    src={story.image}
                    alt=""
                    className="size-16 rounded-full object-cover"
                  />
                </span>
              </span>
              <span className="w-full truncate text-center text-[11px] font-medium">
                {story.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col">
        {posts.map((post) => (
          <article
            key={post.id}
            className="border-b border-line pb-4 dark:border-white/10"
          >
            <header className="flex items-center gap-3 px-4 py-3">
              <img
                src={post.avatar}
                alt=""
                className="size-10 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{post.author}</p>
                <p className="text-xs text-muted dark:text-gray-400">
                  @{post.handle} · {post.time}
                </p>
              </div>
              <button
                type="button"
                aria-label="Más opciones"
                className="ml-auto flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Icon name="more_horiz" />
              </button>
            </header>

            <Link to={`/recipe/${post.id}`} className="relative block">
              <img
                src={post.image}
                alt={post.alt}
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink backdrop-blur">
                {post.difficulty}
              </span>
            </Link>

            <div className="flex items-center gap-4 px-4 pt-3">
              <button
                type="button"
                aria-label="Me gusta"
                className="text-ink transition-transform hover:text-primary active:scale-90 dark:text-white"
              >
                <Icon name="favorite" className="text-[26px]" />
              </button>
              <Link
                to={`/recipe/${post.id}`}
                aria-label="Ver comentarios"
                className="text-ink transition-colors hover:text-primary dark:text-white"
              >
                <Icon name="mode_comment" className="text-[24px]" />
              </Link>
              <button
                type="button"
                aria-label="Compartir"
                className="text-ink transition-colors hover:text-primary dark:text-white"
              >
                <Icon name="send" className="text-[24px]" />
              </button>
              <button
                type="button"
                aria-label="Guardar"
                className="ml-auto text-ink transition-colors hover:text-primary dark:text-white"
              >
                <Icon name="bookmark" className="text-[24px]" />
              </button>
            </div>

            <div className="space-y-1 px-4 pt-2">
              <p className="text-sm font-bold">{post.likes} me gusta</p>
              <p className="text-sm leading-snug">
                <Link to={`/profile`} className="font-bold hover:text-primary">
                  @{post.handle}
                </Link>{' '}
                {post.caption}
              </p>
              <Link
                to={`/recipe/${post.id}`}
                className="block text-sm text-muted hover:text-primary dark:text-gray-400"
              >
                Ver los {post.comments} comentarios
              </Link>
              <p className="text-[10px] uppercase tracking-wide text-muted dark:text-gray-500">
                {post.time}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <Icon name="check_circle" className="text-[28px] text-primary" />
        <p className="text-sm font-bold">Estás al día</p>
        <p className="text-xs text-muted dark:text-gray-400">
          Sigue a más cocineros para llenar tu feed de ideas.
        </p>
        <Link
          to="/search"
          className="mt-2 rounded-full bg-primary-soft px-4 py-2 text-xs font-bold text-primary dark:bg-white/5"
        >
          Descubrir recetas
        </Link>
      </div>
    </div>
  )
}
