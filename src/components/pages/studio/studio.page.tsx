import React, { lazy, Suspense, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Bugsnag from "@bugsnag/js";
import { useStudioStore } from "@/stores/studio.store";
import { useStudioModeStore } from "@/stores/studio-mode.store";
import { useFlowStore } from "@/stores/flow.store";
import { ROUTES } from "@/constants/routes.constants";
import { StudioTabs } from "./components/studio-tabs";
import { SessionSwitcher } from "./components/session-switcher";
import { useStudioJobProgress } from "./hooks/useStudioJobProgress";
import { useSessionAutoSave } from "./hooks/useSessionAutoSave";
import { useFileDropUpload } from "./hooks/useFileDropUpload";
import { useUploadImageDream } from "@/api/dream/mutation/useUploadImageDream";
import useAuth from "@/hooks/useAuth";
import usePermission from "@/hooks/usePermission";
import { useUser } from "@/api/user/query/useUser";
import { CreditsMeter } from "@/components/shared/credits-meter/credits-meter";
import { PROFILE_PERMISSIONS } from "@/constants/permissions.constants";
import {
  StudioContainer,
  StudioHeader,
  StudioTitle,
  TitleGroup,
  Logo,
  LogoLink,
  BackButton,
  HeaderSpacer,
  StudioBody,
  ModeToggle,
  ModeButton,
} from "./studio.page.styled";

const ImagesTab = lazy(() =>
  import("./components/images-tab").then((m) => ({ default: m.ImagesTab })),
);
const ActionsTab = lazy(() =>
  import("./components/actions-tab").then((m) => ({ default: m.ActionsTab })),
);
const GenerateTab = lazy(() =>
  import("./components/generate-tab").then((m) => ({ default: m.GenerateTab })),
);
const ResultsTab = lazy(() =>
  import("./components/results-tab").then((m) => ({ default: m.ResultsTab })),
);
const FlowBuilder = lazy(() =>
  import("./components/flow-builder").then((m) => ({
    default: m.FlowBuilder,
  })),
);

export const StudioPage: React.FC = () => {
  const navigate = useNavigate();
  const mode = useStudioModeStore((s) => s.mode);
  const setMode = useStudioModeStore((s) => s.setMode);

  const activeTab = useStudioStore((s) => s.activeTab);
  useStudioJobProgress();
  useSessionAutoSave();

  const { user: authUser } = useAuth();
  const canManageProviderKey = usePermission({
    permission: PROFILE_PERMISSIONS.CAN_MANAGE_PROVIDER_KEY,
  });
  const { data: userData } = useUser({
    uuid: authUser?.uuid,
    enabled: canManageProviderKey,
  });
  const currentUser = userData?.data?.user;

  const addImage = useStudioStore((s) => s.addImage);
  const updateImage = useStudioStore((s) => s.updateImage);
  const addKeyframe = useFlowStore((s) => s.addKeyframe);
  const uploadDream = useUploadImageDream();

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(ROUTES.REMOTE_CONTROL);
    }
  }, [navigate]);

  const handleStudioDrop = useCallback(
    async (files: File[]) => {
      const currentMode = useStudioModeStore.getState().mode;

      for (const file of files) {
        if (currentMode === "batch") {
          const placeholderUuid = uuidv4();
          const blobUrl = URL.createObjectURL(file);
          addImage({
            uuid: placeholderUuid,
            url: blobUrl,
            name: file.name.replace(/\.[^.]+$/, ""),
            status: "processing",
            selected: false,
          });

          try {
            const result = await uploadDream.mutateAsync({ file });
            updateImage(placeholderUuid, {
              uuid: result.dreamUuid,
              url: result.imageUrl,
              status: "processed",
              name: result.name,
            });
          } catch (err) {
            Bugsnag.notify(err as Error);
            updateImage(placeholderUuid, { status: "failed" });
          } finally {
            URL.revokeObjectURL(blobUrl);
          }
        } else {
          try {
            const result = await uploadDream.mutateAsync({ file });
            addKeyframe({
              id: uuidv4(),
              dreamUuid: result.dreamUuid,
              imageUrl: result.imageUrl,
              name: result.name,
            });
          } catch (err) {
            Bugsnag.notify(err as Error);
          }
        }
      }
    },
    [addImage, updateImage, addKeyframe, uploadDream],
  );

  const { isDragOver, dropHandlers } = useFileDropUpload({
    accept: ["image/jpeg", "image/png", "image/webp"],
    onFiles: handleStudioDrop,
  });

  return (
    <StudioContainer $dragOver={isDragOver} {...dropHandlers}>
      <StudioHeader>
        <BackButton onClick={handleBack} aria-label="Go back">
          <ArrowLeft size={16} />
        </BackButton>
        <TitleGroup>
          <LogoLink to={ROUTES.ROOT} aria-label="Go to home">
            <Logo src="/images/edream-logo-512x512.png" alt="e-dream" />
          </LogoLink>
          <StudioTitle>Studio</StudioTitle>
        </TitleGroup>
        <ModeToggle>
          <ModeButton $active={mode === "flow"} onClick={() => setMode("flow")}>
            Flow
          </ModeButton>
          <ModeButton
            $active={mode === "batch"}
            onClick={() => setMode("batch")}
          >
            Batch (Advanced)
          </ModeButton>
        </ModeToggle>
        <HeaderSpacer />
        {canManageProviderKey ? (
          <CreditsMeter user={currentUser} compact />
        ) : null}
        <SessionSwitcher />
      </StudioHeader>

      <StudioBody $constrain={mode === "batch"}>
        <Suspense fallback={null}>
          {mode === "flow" && <FlowBuilder />}
          {mode === "batch" && (
            <>
              <StudioTabs />
              {activeTab === "images" && <ImagesTab />}
              {activeTab === "actions" && <ActionsTab />}
              {activeTab === "generate" && <GenerateTab />}
              {activeTab === "results" && <ResultsTab />}
            </>
          )}
        </Suspense>
      </StudioBody>
    </StudioContainer>
  );
};
