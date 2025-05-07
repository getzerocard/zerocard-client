import { useState, useEffect, useCallback } from 'react';
import { 
  resolveBasenameToAddress, 
  resolveAddressToBasename,
  isValidAddress,
  isValidBasename,
  isBasenameWithSuffix
} from '../utils/basenameResolver';

export type AddressStatus = 'idle' | 'checking' | 'found' | 'not_found' | 'direct_address';

interface UseBasenameResolverProps {
  input?: string;
  debounceMs?: number;
}

interface UseBasenameResolverResult {
  status: AddressStatus;
  resolvedAddress: string | null;
  resolvedName: string | null;
  error: Error | null;
  checkInput: (input: string) => void;
  reset: () => void;
}

/**
 * Hook for resolving Base names to addresses and vice versa
 */
export function useBasenameResolver({
  input = '',
  debounceMs = 500
}: UseBasenameResolverProps = {}): UseBasenameResolverResult {
  const [status, setStatus] = useState<AddressStatus>('idle');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [currentInput, setCurrentInput] = useState<string>(input);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setResolvedAddress(null);
    setResolvedName(null);
    setError(null);
    setCurrentInput('');
    
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      setDebounceTimeout(null);
    }
  }, [debounceTimeout]);

  const checkInput = useCallback((input: string) => {
    setCurrentInput(input);
    
    // Clear any pending debounce
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Reset results
    setResolvedAddress(null);
    setResolvedName(null);
    setError(null);

    // Handle empty input
    if (!input.trim()) {
      setStatus('idle');
      return;
    }

    // Check if input is a direct Ethereum address
    if (isValidAddress(input)) {
      setStatus('direct_address');
      setResolvedAddress(input);
      
      // Optionally resolve reverse lookup
      const timeout = setTimeout(async () => {
        try {
          const name = await resolveAddressToBasename(input);
          if (name) {
            setResolvedName(name);
          }
        } catch (err) {
          console.error('Error in reverse lookup:', err);
        }
      }, debounceMs);
      
      setDebounceTimeout(timeout);
      return;
    }

    // Only resolve when fully qualified basename is entered (ending in .base.eth)
    if (isBasenameWithSuffix(input)) {
      setStatus('checking');
      
      const timeout = setTimeout(async () => {
        try {
          const address = await resolveBasenameToAddress(input);
          
          if (address) {
            setStatus('found');
            setResolvedAddress(address);
          } else {
            setStatus('not_found');
          }
        } catch (err) {
          setStatus('not_found');
          setError(err instanceof Error ? err : new Error('Unknown error'));
          console.error('Error resolving basename:', err);
        }
      }, debounceMs);
      
      setDebounceTimeout(timeout);
    } else {
      // Any other input (partial or invalid) remains idle until suffix is complete
      setStatus('idle');
    }
  }, [debounceMs, debounceTimeout]);

  // Auto-check when input prop changes
  useEffect(() => {
    if (input && input !== currentInput) {
      checkInput(input);
    }
  }, [input, currentInput, checkInput]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return {
    status,
    resolvedAddress,
    resolvedName,
    error,
    checkInput,
    reset
  };
} 