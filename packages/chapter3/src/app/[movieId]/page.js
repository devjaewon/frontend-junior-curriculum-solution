import MovieDetailCard from "@/components/MovieDetailCard";
import MovieDetailWrap from "@/components/MovieDetailWrap";
import { useMemo } from "react";

export default function MoveDetailPage({ params }) {
  const { movieId: movieIdParam = '' } = params;
  const movieId = useMemo(() => parseInt(movieIdParam), [movieIdParam]);

  if (Number.isNaN(movieId)) {
    throw new Error('invalid movie id');
  }

  return (
    <MovieDetailWrap>
      <MovieDetailCard id={movieId} />
    </MovieDetailWrap>
  )
}