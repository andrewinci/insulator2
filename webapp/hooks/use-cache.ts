import { useEffect, useState } from "react";

export type CacheProps<T> = {
  key: string;
  initialValue: T;
};

export function useCache<T>(props: CacheProps<T>, deps: unknown[]): [T, (reducer: (prev: T) => T) => void] {
  const [state, _setState] = useState(props.initialValue);
  if (!sessionStorage.getItem(props.key)) {
    sessionStorage.setItem(props.key, JSON.stringify(props.initialValue));
  }
  useEffect(() => {
    const stored = sessionStorage.getItem(props.key);
    if (stored) {
      _setState(JSON.parse(stored));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  const setState = (reducer: (prev: T) => T): void => {
    _setState((s) => {
      const newState = reducer(s);
      sessionStorage.setItem(props.key, JSON.stringify(newState));
      return newState;
    });
  };
  return [state, setState];
}
