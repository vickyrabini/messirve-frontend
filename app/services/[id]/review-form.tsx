'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { submitReview } from '@/app/actions/reviews'
import { StarRating } from '@/components/star-rating'

const initialState = { error: null }

type Props = {
  serviceId: string
  initialStars: number | null
  initialComment: string
  isAuthenticated: boolean
}

export function ReviewForm({ serviceId, initialStars, initialComment, isAuthenticated }: Props) {
  const [state, formAction, isPending] = useActionState(submitReview, initialState)
  const [stars, setStars] = useState(initialStars ?? 0)

  return (
    <div className="mt-8 rounded-2xl border border-gris/40 bg-white p-6">
      <h3 className="font-brand uppercase text-lg text-ink">
        {initialStars ? 'Editá tu reseña' : 'Dejá tu reseña'}
      </h3>

      <form action={formAction} className="mt-4 flex flex-col gap-4">
        <input type="hidden" name="serviceId" value={serviceId} />
        <input type="hidden" name="stars" value={stars} />

        {!isAuthenticated && (
          <p className="text-[13px] text-muted">
            <Link href="/login" className="font-semibold text-celeste-deep hover:underline">
              Iniciá sesión
            </Link>{' '}
            para calificar y dejar tu reseña.
          </p>
        )}

        <fieldset disabled={!isAuthenticated} className={`flex flex-col gap-4 ${!isAuthenticated ? 'opacity-60' : ''}`}>
          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-ink">Tu calificación</label>
            <StarRating value={stars} size={26} onRate={setStars} />
          </div>

          <div>
            <label htmlFor="comment" className="mb-1.5 block text-[14px] font-semibold text-ink">
              Comentario (opcional)
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              defaultValue={initialComment}
              placeholder="Contá tu experiencia con este servicio…"
              className="w-full rounded-xl border border-gris/60 bg-cream px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 focus:border-celeste focus:outline-none focus:ring-4 focus:ring-celeste/20"
            />
          </div>

          {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-500">{state.error}</p>}
          {state?.success && (
            <p className="rounded-lg bg-[#E7F1E9] px-3 py-2 text-[13px] font-semibold text-[#2E7D46]">
              ¡Gracias por tu reseña!
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || stars === 0}
            className="self-start rounded-full bg-celeste-deep px-6 py-3 text-[15px] font-semibold text-white shadow-soft transition-colors hover:bg-[#15212F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Guardando...' : 'Publicar reseña'}
          </button>
        </fieldset>
      </form>
    </div>
  )
}
