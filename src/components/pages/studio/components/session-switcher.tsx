import React, { useCallback, useRef, useState } from "react";
import { ChevronDown, Plus, Pencil, Copy, Trash2, Film } from "lucide-react";
import { useSessionStore } from "@/stores/session.store";
import useOutsideClick from "@/hooks/useOutsideClick";
import {
  SwitcherContainer,
  Trigger,
  TriggerLabel,
  TriggerCaret,
  Dropdown,
  DropdownHeader,
  DropdownCount,
  SessionList,
  SessionItem,
  SessionThumb,
  SessionInfo,
  SessionName,
  SessionMeta,
  ModeBadge,
  RenameInput,
  RowActions,
  IconButton,
  DropdownFooter,
  NewSessionButton,
} from "./session-switcher.styled";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

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

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setEditingId(null);
  }, []);
  useOutsideClick(containerRef, closeDropdown);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleNew = useCallback(() => {
    createSession();
    setOpen(false);
  }, [createSession]);

  const handleSwitch = useCallback(
    (id: string) => {
      if (id !== activeSessionId) switchSession(id);
      setOpen(false);
    },
    [activeSessionId, switchSession],
  );

  const startRename = useCallback((id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  }, []);

  const commitRename = useCallback(() => {
    if (editingId) {
      const name = editName.trim();
      if (name) renameSession(editingId, name);
    }
    setEditingId(null);
  }, [editingId, editName, renameSession]);

  return (
    <SwitcherContainer ref={containerRef}>
      <Trigger
        type="button"
        $open={open}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <TriggerLabel>{activeSession?.name ?? "No session"}</TriggerLabel>
        <TriggerCaret $open={open}>
          <ChevronDown size={14} />
        </TriggerCaret>
      </Trigger>

      {open && (
        <Dropdown>
          <DropdownHeader>
            <span>Sessions</span>
            <DropdownCount>{sessions.length}</DropdownCount>
          </DropdownHeader>

          <SessionList>
            {sessions.map((session) => {
              const isEditing = editingId === session.id;
              return (
                <SessionItem
                  key={session.id}
                  $active={session.id === activeSessionId}
                  onClick={() => !isEditing && handleSwitch(session.id)}
                >
                  <SessionThumb>
                    {session.thumbnail ? (
                      <img src={session.thumbnail} alt="" />
                    ) : (
                      <Film size={14} />
                    )}
                  </SessionThumb>

                  <SessionInfo>
                    {isEditing ? (
                      <RenameInput
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={commitRename}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                    ) : (
                      <>
                        <SessionName>{session.name}</SessionName>
                        <SessionMeta>
                          {formatDate(session.updatedAt)}
                          <ModeBadge $mode={session.mode}>
                            {session.mode}
                          </ModeBadge>
                        </SessionMeta>
                      </>
                    )}
                  </SessionInfo>

                  {!isEditing && (
                    <RowActions>
                      <IconButton
                        aria-label="Rename session"
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(session.id, session.name);
                        }}
                      >
                        <Pencil size={14} />
                      </IconButton>
                      <IconButton
                        aria-label="Duplicate session"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSession(session.id);
                        }}
                      >
                        <Copy size={14} />
                      </IconButton>
                      {sessions.length > 1 && (
                        <IconButton
                          $danger
                          aria-label="Delete session"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      )}
                    </RowActions>
                  )}
                </SessionItem>
              );
            })}
          </SessionList>

          <DropdownFooter>
            <NewSessionButton type="button" onClick={handleNew}>
              <Plus size={15} /> New session
            </NewSessionButton>
          </DropdownFooter>
        </Dropdown>
      )}
    </SwitcherContainer>
  );
};
