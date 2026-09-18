import React from "react";
import { Search, X } from "lucide-react";
import type { StudioMode } from "@/types/flow.types";
import { STUDIO_MODES, STUDIO_MODE_LABELS } from "../constants/studio-modes";
import {
  Controls,
  ControlsSpacer,
  FilterButton,
  FilterToggle,
  SearchClear,
  SearchField,
  SearchIcon,
  SearchInput,
  SectionLabel,
} from "../studio-projects.page.styled";

type Props = {
  editorFilter?: StudioMode;
  onEditorFilterChange: (mode?: StudioMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
};

export const ProjectControls: React.FC<Props> = ({
  editorFilter,
  onEditorFilterChange,
  search,
  onSearchChange,
}) => (
  <Controls>
    <SectionLabel>Projects</SectionLabel>

    <FilterToggle role="group" aria-label="Filter projects by editor">
      <FilterButton
        type="button"
        $active={editorFilter === undefined}
        aria-pressed={editorFilter === undefined}
        onClick={() => onEditorFilterChange(undefined)}
      >
        Everything
      </FilterButton>
      {STUDIO_MODES.map((mode) => (
        <FilterButton
          key={mode}
          type="button"
          $active={editorFilter === mode}
          aria-pressed={editorFilter === mode}
          onClick={() => onEditorFilterChange(mode)}
        >
          {STUDIO_MODE_LABELS[mode]}
        </FilterButton>
      ))}
    </FilterToggle>

    <ControlsSpacer />

    <SearchField>
      <SearchIcon>
        <Search size={14} strokeWidth={2.2} />
      </SearchIcon>
      <SearchInput
        type="search"
        value={search}
        placeholder="Search projects"
        aria-label="Search projects"
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {search ? (
        <SearchClear
          type="button"
          aria-label="Clear search"
          onClick={() => onSearchChange("")}
        >
          <X size={14} strokeWidth={2.4} />
        </SearchClear>
      ) : null}
    </SearchField>
  </Controls>
);
