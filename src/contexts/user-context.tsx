'use client';

import * as React from 'react';

import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  checked: boolean;
  checkSession?: () => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(
  undefined
);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({
  children,
}: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<{
    user: User | null;
    error: string | null;
    isLoading: boolean;
    checked: boolean;
  }>({
    user: null,
    error: null,
    isLoading: true,
    checked: false,
  });

  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      const { data, checked, error } = await authClient.getUser();
      if (error) {
        logger.error(error);
        setState((prev) => ({
          ...prev,
          user: null,
          error: 'Something went wrong',
          isLoading: false,
          checked: false,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        user: data ?? null,
        error: null,
        isLoading: false,
        checked,
      }));
    } catch (err) {
      logger.error(err);
      setState((prev) => ({
        ...prev,
        user: null,
        error: 'Something went wrong',
        isLoading: false,
        checked: false,
      }));
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((err: unknown) => {
      logger.error(err);
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, []);

  return (
    <UserContext.Provider value={{ ...state, checkSession }}>
      {children}
    </UserContext.Provider>
  );
}

export const UserConsumer = UserContext.Consumer;
