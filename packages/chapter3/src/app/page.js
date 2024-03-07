import { Suspense } from 'react';
import SearchInput from '@/components/SearchInput';
import MovieList from '@/components/MovieList';
import Loading from '@/components/Loading';

export default function Home({ searchParams }) {
  // MovieList를 서버에서 그릴 것이기 때문에 Home은 서버 컴포넌트로 수행되어야 합니다.
  // 서버 컴포넌트에서는 useRouter를 사용할 수 없습니다.
  // props로 searchParams를 확인할 수 있습니다.
  const { query = '' } = searchParams;

  return (
    <>
      <SearchInput />
      {/* query 값이 달라질 경우 fallback을 다시 그려주기 위해서 key 값을 설정합니다. */}
      <Suspense key={query} fallback={<Loading />}>
        <MovieList query={query} />
      </Suspense>
    </>
  );
}
