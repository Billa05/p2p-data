import { useContext } from 'react';
import { FileContext } from '@/contexts/FileContext';

export function useFiles() {
  return useContext(FileContext);
}