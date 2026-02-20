'use client';
import React from 'react';
import { useAppContext } from '../context/AppContext';
import AuthModal from './Auth';

const GlobalComponents = () => {
  const { isAuthOpen, setIsAuthOpen } = useAppContext();
  
  return (
    <>
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </>
  );
};

export default GlobalComponents;
