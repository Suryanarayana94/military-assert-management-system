import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function useReferenceData() {
  const { user } = useAuth();
  const [reference, setReference] = useState({ bases: [], equipmentTypes: [] });
  const [error, setError] = useState('');
  useEffect(() => { api.reference(user).then(setReference).catch((failure) => setError(failure.message)); }, [user]);
  return { reference, error };
}
