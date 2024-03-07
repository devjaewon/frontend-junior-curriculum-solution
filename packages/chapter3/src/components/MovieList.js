import MovieRepository from "@/persist/MovieRepository";
import MovieCard from "./MovieCard";

// 비동기 컴포넌트로 서버 컴포넌트를 손쉽게 구현합니다.
// Suspense와 함께 동작합니다.
export default async function MovieList({ query }) {
  const movies = await MovieRepository.instance.search(query);

  if (movies.length === 0) {
    return (
      <p className="notice">Not found movies</p>
    )
  }

  return (
    <ul className="movie-list">
      {movies.map(movie => (
        <li className="item" key={movie.id}>
          <MovieCard {...movie} />
        </li>
      ))}
    </ul>
  )
}
