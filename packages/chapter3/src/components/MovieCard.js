'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function MovieCard({
  id,
  title,
  description,
}) {
  const href = `/${id}`;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(e) {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <Link
      href={href}
      className={isPending ? 'movie-card blink' : 'movie-card'}
      onClick={handleClick}
    >
      <strong className="title">{title}</strong>
      <p className="desc">{description}</p>
    </Link>
  );
}
