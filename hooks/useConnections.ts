import { useContext } from 'react';
import { ConnectionContext } from '@/contexts/ConnectionContext';

export function useConnections() {
  return useContext(ConnectionContext);
}