'use client';

import { useEffect, useState } from "react"

export default function MovieDetailWrap({ children }) {
  const [color, setColor] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setColor('blue');
    }, 2000);

    return () => {
      clearTimeout(timer);
    }
  }, []);

  return (
    <div className={`movie-detail-wrap ${color}`}>{children}</div>
  )
}