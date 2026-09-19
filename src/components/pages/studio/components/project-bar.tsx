import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bar, NameInput } from "./project-bar.styled";

type Props = {
  name: string;
  disabled?: boolean;
  onRename: (name: string) => void;
  children?: React.ReactNode;
};

export const ProjectBar: React.FC<Props> = ({
  name,
  disabled = false,
  onRename,
  children,
}) => {
  const [draft, setDraft] = useState(name);
  const committedRef = useRef(name);

  useEffect(() => {
    committedRef.current = name;
    setDraft(name);
  }, [name]);

  const commit = useCallback(() => {
    const next = draft.trim();
    if (!next || next === committedRef.current) {
      setDraft(committedRef.current);
      return;
    }
    committedRef.current = next;
    onRename(next);
  }, [draft, onRename]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.currentTarget.blur();
      } else if (event.key === "Escape") {
        setDraft(committedRef.current);
        event.currentTarget.blur();
      }
    },
    [],
  );

  return (
    <Bar>
      <NameInput
        value={draft}
        disabled={disabled}
        placeholder="Untitled"
        aria-label="Playlist name"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
      />
      {children}
    </Bar>
  );
};
