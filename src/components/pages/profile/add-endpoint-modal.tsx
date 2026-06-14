import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCreateUserApiEndpoint } from "@/api/user-api-endpoints/useCreateUserApiEndpoint";
import { useUpdateUserApiEndpoint } from "@/api/user-api-endpoints/useUpdateUserApiEndpoint";
import { ENDPOINT_PRESETS } from "@/constants/endpoint-presets";
import { toast } from "react-toastify";
import type { EndpointPreset } from "@/constants/endpoint-presets";
import type {
  UserApiEndpoint,
  EndpointProviderType,
} from "@/types/user-api-endpoint.types";
import {
  ModalOverlay,
  ModalContent,
  ModalTitle,
  PresetCard,
  PresetIcon,
  PresetInfo,
  PresetName,
  PresetDesc,
  PresetCaps,
  FormGroup,
  FormLabel,
  FormInput,
  FormSelect,
  FormHint,
  FormError,
  ButtonRow,
  ModalButton,
  CustomFields,
} from "./add-endpoint-modal.styled";

const PROVIDER_COLORS: Record<string, string> = {
  fal: "#1a1a2e",
  openai: "#1a2e1a",
};

interface AddEndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEndpoint: UserApiEndpoint | null;
}

export function AddEndpointModal({
  isOpen,
  onClose,
  editingEndpoint,
}: AddEndpointModalProps) {
  const createMutation = useCreateUserApiEndpoint();
  const updateMutation = useUpdateUserApiEndpoint();

  const [step, setStep] = useState<"preset" | "form">(
    editingEndpoint ? "form" : "preset",
  );
  const [selectedPreset, setSelectedPreset] = useState<EndpointPreset | null>(
    null,
  );
  const [isCustom, setIsCustom] = useState(false);

  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [modelId, setModelId] = useState("");
  const [providerType, setProviderType] =
    useState<EndpointProviderType>("openai");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingEndpoint) {
        setStep("form");
        setName(editingEndpoint.name);
        setApiKey("");
        setEndpointUrl(editingEndpoint.endpointUrl);
        setModelId(editingEndpoint.modelId);
        setProviderType(editingEndpoint.providerType);
        const preset = ENDPOINT_PRESETS.find(
          (p) => p.id === editingEndpoint.presetId,
        );
        setSelectedPreset(preset ?? null);
        setIsCustom(!preset);
      } else {
        setStep("preset");
        setSelectedPreset(null);
        setIsCustom(false);
        setName("");
        setApiKey("");
        setEndpointUrl("");
        setModelId("");
        setProviderType("openai");
      }
      setError("");
    }
  }, [isOpen, editingEndpoint]);

  const handleSelectPreset = useCallback((preset: EndpointPreset) => {
    setSelectedPreset(preset);
    setIsCustom(false);
    setName(preset.name);
    setEndpointUrl(preset.endpointUrl);
    setModelId(preset.modelId);
    setProviderType(preset.providerType);
    setStep("form");
  }, []);

  const handleSelectCustom = useCallback(() => {
    setSelectedPreset(null);
    setIsCustom(true);
    setName("");
    setEndpointUrl("");
    setModelId("");
    setProviderType("openai");
    setStep("form");
  }, []);

  const handleSave = useCallback(async () => {
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!editingEndpoint && !apiKey.trim()) {
      setError("API key is required");
      return;
    }
    if (isCustom && !endpointUrl.trim()) {
      setError("Endpoint URL is required");
      return;
    }
    if (isCustom && !modelId.trim()) {
      setError("Model ID is required");
      return;
    }

    if (editingEndpoint) {
      updateMutation.mutate(
        {
          uuid: editingEndpoint.uuid,
          name: name.trim(),
          ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
          ...(isCustom
            ? { endpointUrl: endpointUrl.trim(), modelId: modelId.trim() }
            : {}),
        },
        {
          onSuccess: () => {
            toast.success("Endpoint updated");
            onClose();
          },
          onError: (err) => {
            setError(err.message || "Failed to update endpoint");
          },
        },
      );
    } else {
      const preset = selectedPreset;
      createMutation.mutate(
        {
          name: name.trim(),
          providerType: isCustom ? providerType : preset!.providerType,
          presetId: preset?.id ?? "custom",
          endpointUrl: isCustom ? endpointUrl.trim() : preset!.endpointUrl,
          apiKey: apiKey.trim(),
          modelId: isCustom ? modelId.trim() : preset!.modelId,
          capabilities: preset?.capabilities ?? {
            textToImage: true,
            imageToImage: true,
            sizes: ["1024x1024"],
          },
        },
        {
          onSuccess: () => {
            toast.success("Endpoint added");
            onClose();
          },
          onError: (err) => {
            setError(err.message || "Failed to create endpoint");
          },
        },
      );
    }
  }, [
    name,
    apiKey,
    endpointUrl,
    modelId,
    providerType,
    isCustom,
    selectedPreset,
    editingEndpoint,
    createMutation,
    updateMutation,
    onClose,
  ]);

  if (!isOpen) return null;

  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  return createPortal(
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {step === "preset" ? (
          <>
            <ModalTitle>Add Endpoint — Choose Service</ModalTitle>
            {ENDPOINT_PRESETS.map((preset) => (
              <PresetCard
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
              >
                <PresetIcon
                  $color={PROVIDER_COLORS[preset.providerType] ?? "#2a2a2a"}
                >
                  {preset.providerType === "fal" ? "F" : "O"}
                </PresetIcon>
                <PresetInfo>
                  <PresetName>{preset.name}</PresetName>
                  <PresetDesc>{preset.description}</PresetDesc>
                </PresetInfo>
                <PresetCaps>
                  {[
                    preset.capabilities.textToImage && "t2i",
                    preset.capabilities.imageToImage && "i2i",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </PresetCaps>
              </PresetCard>
            ))}

            <PresetCard onClick={handleSelectCustom} style={{ opacity: 0.7 }}>
              <PresetIcon $color="#2a2a2a">⚙</PresetIcon>
              <PresetInfo>
                <PresetName>Custom OpenAI-Compatible</PresetName>
                <PresetDesc>
                  Any endpoint that speaks OpenAI format
                </PresetDesc>
              </PresetInfo>
              <PresetCaps style={{ color: "#888" }}>manual</PresetCaps>
            </PresetCard>
          </>
        ) : (
          <>
            <ModalTitle>
              {editingEndpoint ? "Edit Endpoint" : "Add Endpoint"}
            </ModalTitle>

            <FormGroup>
              <FormLabel>Display Name</FormLabel>
              <FormInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Flux Schnell"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>API Key</FormLabel>
              <FormInput
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  editingEndpoint
                    ? `Current: ••••••••${editingEndpoint.apiKeyLastFour}`
                    : "Paste your API key"
                }
              />
              <FormHint>
                Your key is encrypted at rest and never shared.
                {selectedPreset && (
                  <>
                    {" "}
                    <a
                      href={selectedPreset.keyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get a key →
                    </a>
                  </>
                )}
              </FormHint>
            </FormGroup>

            {isCustom && (
              <CustomFields>
                <FormGroup>
                  <FormLabel>Provider Type</FormLabel>
                  <FormSelect
                    value={providerType}
                    onChange={(e) =>
                      setProviderType(
                        e.target.value as EndpointProviderType,
                      )
                    }
                  >
                    <option value="openai">OpenAI-Compatible</option>
                    <option value="fal">FAL</option>
                  </FormSelect>
                </FormGroup>

                <FormGroup>
                  <FormLabel>Endpoint URL</FormLabel>
                  <FormInput
                    value={endpointUrl}
                    onChange={(e) => setEndpointUrl(e.target.value)}
                    placeholder="https://api.example.com/v1"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Model ID</FormLabel>
                  <FormInput
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    placeholder="model-name"
                  />
                </FormGroup>
              </CustomFields>
            )}

            {error && <FormError>{error}</FormError>}

            <ButtonRow>
              {!editingEndpoint && (
                <ModalButton onClick={() => setStep("preset")}>
                  Back
                </ModalButton>
              )}
              <ModalButton $outline onClick={onClose}>
                Cancel
              </ModalButton>
              <ModalButton $accent onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </ModalButton>
            </ButtonRow>
          </>
        )}
      </ModalContent>
    </ModalOverlay>,
    document.body,
  );
}
