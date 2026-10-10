import { useActionPlaylistSync } from "../hooks/useActionPlaylistSync";

export function ActionPlaylistSync({ enabled }: { enabled: boolean }) {
  useActionPlaylistSync(enabled);
  return null;
}
