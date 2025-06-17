import { useState, useRef, useCallback } from 'react';

export function useChatInput() {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const clearInput = useCallback(() => {
    setInputValue("");
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, onSubmit: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }, []);

  return {
    inputValue,
    setInputValue,
    inputRef,
    clearInput,
    focusInput,
    handleKeyDown
  };
}