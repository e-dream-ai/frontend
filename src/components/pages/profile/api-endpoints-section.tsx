import { useState, useCallback } from "react";
import { useUserApiEndpoints } from "@/api/user-api-endpoints/useUserApiEndpoints";
import { useDeleteUserApiEndpoint } from "@/api/user-api-endpoints/useDeleteUserApiEndpoint";
import { useTestUserApiEndpoint } from "@/api/user-api-endpoints/useTestUserApiEndpoint";
import { AddEndpointModal } from "./add-endpoint-modal";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { Text } from "@/components/shared";
import { toast } from "react-toastify";
import type { UserApiEndpoint } from "@/types/user-api-endpoint.types";
import {
  SectionContainer,
  SectionHeader,
  SectionTitle,
  SectionSubtitle,
  AddButton,
  EmptyState,
  EndpointCard,
  EndpointInfo,
  ProviderIcon,
  EndpointName,
  EndpointMeta,
  StatusDot,
  EndpointActions,
  ActionBtn,
} from "./api-endpoints-section.styled";

const PROVIDER_COLORS: Record<string, string> = {
  fal: "#1a1a2e",
  openai: "#1a2e1a",
};

export function ApiEndpointsSection() {
  const { data } = useUserApiEndpoints();
  const deleteMutation = useDeleteUserApiEndpoint();
  const testMutation = useTestUserApiEndpoint();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] =
    useState<UserApiEndpoint | null>(null);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  const endpoints = data?.data?.endpoints ?? [];

  const handleDelete = useCallback((uuid: string) => {
    setDeletingUuid(uuid);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeletingUuid(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingUuid) return;
    deleteMutation.mutate(deletingUuid, {
      onSuccess: () => {
        toast.success("Endpoint deleted");
        setDeletingUuid(null);
      },
      onError: () => {
        toast.error("Failed to delete endpoint");
        setDeletingUuid(null);
      },
    });
  }, [deleteMutation, deletingUuid]);

  const handleTest = useCallback(
    (uuid: string) => {
      testMutation.mutate(uuid, {
        onSuccess: () => toast.success("Connection successful"),
        onError: (err) => toast.error(err.message || "Connection failed"),
      });
    },
    [testMutation],
  );

  const handleEdit = useCallback((endpoint: UserApiEndpoint) => {
    setEditingEndpoint(endpoint);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingEndpoint(null);
  }, []);

  return (
    <SectionContainer>
      <SectionHeader>
        <div>
          <SectionTitle>Your API Endpoints</SectionTitle>
          <SectionSubtitle>
            Bring your own AI models to the studio
          </SectionSubtitle>
        </div>
        <AddButton onClick={() => setModalOpen(true)}>+ Add Endpoint</AddButton>
      </SectionHeader>

      {endpoints.length === 0 ? (
        <EmptyState>
          No endpoints configured.
          <br />
          Add an endpoint to use Flux, OpenAI, or other models in the studio.
        </EmptyState>
      ) : (
        endpoints.map((ep) => (
          <EndpointCard key={ep.uuid}>
            <EndpointInfo>
              <ProviderIcon
                $color={PROVIDER_COLORS[ep.providerType] ?? "#2a2a2a"}
              >
                {ep.providerType === "fal" ? "F" : "O"}
              </ProviderIcon>
              <div>
                <EndpointName>{ep.name}</EndpointName>
                <EndpointMeta>
                  <StatusDot $color="#4ade80">●</StatusDot> Key: ...
                  {ep.apiKeyLastFour}
                  &nbsp;·&nbsp;
                  {[
                    ep.capabilities.textToImage && "t2i",
                    ep.capabilities.imageToImage && "i2i",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </EndpointMeta>
              </div>
            </EndpointInfo>
            <EndpointActions>
              <ActionBtn
                onClick={() => handleTest(ep.uuid)}
                disabled={testMutation.isLoading}
              >
                Test
              </ActionBtn>
              <ActionBtn onClick={() => handleEdit(ep)}>Edit</ActionBtn>
              <ActionBtn $danger onClick={() => handleDelete(ep.uuid)}>
                Delete
              </ActionBtn>
            </EndpointActions>
          </EndpointCard>
        ))
      )}

      <AddEndpointModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        editingEndpoint={editingEndpoint}
      />

      <ConfirmModal
        isOpen={deletingUuid !== null}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        confirmButtonType="danger"
        confirmText="Delete"
        isConfirming={deleteMutation.isLoading}
        title="Delete endpoint"
        text={<Text>Delete this endpoint? This cannot be undone.</Text>}
      />
    </SectionContainer>
  );
}
