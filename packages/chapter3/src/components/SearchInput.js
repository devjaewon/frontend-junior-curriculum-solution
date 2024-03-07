// 클라이언트에서 인터렉션(값의 입력) 되어야 하는 컴포넌트이기 때문에 클라이언트 컴포넌트로 정의합니다.
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SearchInput() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [text, setText] = useState(searchParams.get('query') || '');

  function navigate(query) {
    router.replace(`${pathname}?query=${query}`);
  }

  function handleChange(e) {
    const query = e.target.value;
    
    setText(query);
    navigate(query);
  }

  return (
    <div className="search-input">
      <div className="box">
        <input
          className="input"
          type="text"
          placeholder="검색어를 입력해주세요"
          value={text}
          onChange={handleChange}
        />
        <div className="border" />
      </div>
    </div>
  )
}
