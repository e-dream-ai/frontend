import React, { useRef } from "react";
import { Search, X } from "lucide-react";
import { SearchInput } from "./select-modal.styled";
import {
  LibrarySearchClear,
  LibrarySearchField,
  LibrarySearchIcon,
} from "./prompt-library.styled";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

export const LibrarySearch: React.FC<Props> = ({
  value,
  onChange,
  placeholder,
  label,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <LibrarySearchField>
      <LibrarySearchIcon aria-hidden="true">
        <Search size={14} strokeWidth={2.2} />
      </LibrarySearchIcon>
      <SearchInput
        ref={inputRef}
        placeholder={placeholder}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-autofocus
      />
      {value ? (
        <LibrarySearchClear
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
        >
          <X size={14} strokeWidth={2.5} />
        </LibrarySearchClear>
      ) : null}
    </LibrarySearchField>
  );
};
