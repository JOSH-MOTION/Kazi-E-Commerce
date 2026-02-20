'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import InfoPages from '../../../components/InfoPages';

export default function InfoPage() {
  const params = useParams();
  const type = params.type as string;

  const validTypes = ['support', 'track-order', 'momo-guide', 'returns'];
  
  if (!validTypes.includes(type)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Page not found</h2>
      </div>
    );
  }

  return <InfoPages type={type as any} />;
}
