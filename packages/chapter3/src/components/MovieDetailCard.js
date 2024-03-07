import MovieRepository from "@/persist/MovieRepository";

export default async function MovieDetailCard({
  id,
}) {
  const movie = await MovieRepository.instance.getDetail(id);

  if (!movie) {
    throw new Error('movie not found');
  }

  return (
    <div className="movie-detail-card">
      <em className="id">#{id}</em>
      <h1 className="heading">{movie.title}</h1>
      <p className="desc">{movie.description}</p>
    </div>
  );
}
