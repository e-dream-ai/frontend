import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChevronDown, Plus, Copy, Trash2 } from "lucide-react";
import { useSessionStore } from "@/stores/session.store";
import {
  SwitcherContainer,
  SwitcherBar,
  TitleInput,
  TitleSizer,
  CaretButton,
  Dropdown,
  SessionItem,
  SessionThumb,
  SessionInfo,
  SessionName,
  SessionMeta,
  ModeBadge,
  DropdownActions,
  ActionButton,
} from "./session-switcher.styled";

export const SessionSwitcher: React.FC = () => {
  const sessions = useSessionStore((s) => s.sessions);
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const createSession = useSessionStore((s) => s.createSession);
  const switchSession = useSessionStore((s) => s.switchSession);
  const deleteSession = useSessionStore((s) => s.deleteSession);
  const duplicateSession = useSessionStore((s) => s.duplicateSession);
  const renameSession = useSessionStore((s) => s.renameSession);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sessions are loaded synchronously at module level in session.store.ts
  // so no loadFromStorage() call is needed here.

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Inline-editable title for the active session. Kept in sync when the active
  // session changes; commits the rename on blur/Enter, reverts on Escape/empty.
  const [titleDraft, setTitleDraft] = useState(activeSession?.name ?? "");
  useEffect(() => {
    setTitleDraft(activeSession?.name ?? "");
  }, [activeSession?.id, activeSession?.name]);

  const commitTitle = useCallback(() => {
    const v = titleDraft.trim();
    if (activeSessionId && v && v !== activeSession?.name) {
      renameSession(activeSessionId, v);
    } else {
      setTitleDraft(activeSession?.name ?? "");
    }
  }, [titleDraft, activeSessionId, activeSession?.name, renameSession]);

  // Auto-size the title input to its content via a hidden mirror span.
  const sizerRef = useRef<HTMLSpanElement>(null);
  const [titleWidth, setTitleWidth] = useState(0);
  useLayoutEffect(() => {
    if (sizerRef.current) {
      setTitleWidth(sizerRef.current.offsetWidth + 2);
    }
  }, [titleDraft, activeSessionId]);

  const handleNew = useCallback(() => {
    createSession();
    setOpen(false);
  }, [createSession]);

  const handleSwitch = useCallback(
    (id: string) => {
      if (id !== activeSessionId) {
        switchSession(id);
      }
      setOpen(false);
    },
    [activeSessionId, switchSession],
  );

  const handleRenameStart = useCallback((id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  }, []);

  const handleRenameCommit = useCallback(() => {
    if (editingId && editName.trim()) {
      renameSession(editingId, editName.trim());
    }
    setEditingId(null);
  }, [editingId, editName, renameSession]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <SwitcherContainer ref={containerRef}>
      <SwitcherBar>
        <TitleInput
          value={titleDraft}
          placeholder="No Session"
          disabled={!activeSessionId}
          style={{ width: titleWidth || undefined }}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
            if (e.key === "Escape") {
              setTitleDraft(activeSession?.name ?? "");
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
        <TitleSizer ref={sizerRef} aria-hidden>
          {titleDraft || "No Session"}
        </TitleSizer>
        <CaretButton
          onClick={() => setOpen((o) => !o)}
          aria-label="Switch session"
        >
          <ChevronDown size={14} />
        </CaretButton>
      </SwitcherBar>

      {open && (
        <Dropdown>
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              $active={session.id === activeSessionId}
              onClick={() => handleSwitch(session.id)}
            >
              <SessionThumb>
                {session.thumbnail && <img src={session.thumbnail} alt="" />}
              </SessionThumb>
              <SessionInfo>
                {editingId === session.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleRenameCommit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameCommit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      font: "inherit",
                      width: "100%",
                      outline: "none",
                    }}
                  />
                ) : (
                  <SessionName
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleRenameStart(session.id, session.name);
                    }}
                  >
                    {session.name}
                  </SessionName>
                )}
                <SessionMeta>
                  {formatDate(session.updatedAt)}{" "}
                  <ModeBadge>{session.mode}</ModeBadge>
                </SessionMeta>
              </SessionInfo>
              <Copy
                size={14}
                style={{ opacity: 0.4, cursor: "pointer", flexShrink: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateSession(session.id);
                }}
              />
              {sessions.length > 1 && (
                <Trash2
                  size={14}
                  style={{ opacity: 0.4, cursor: "pointer", flexShrink: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                />
              )}
            </SessionItem>
          ))}
          <DropdownActions>
            <ActionButton onClick={handleNew}>
              <Plus size={14} /> New Session
            </ActionButton>
          </DropdownActions>
        </Dropdown>
      )}
    </SwitcherContainer>
  );
};
