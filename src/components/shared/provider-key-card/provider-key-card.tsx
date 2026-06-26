import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faKey,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Column, Input, Row } from "@/components/shared";
import { Spinner } from "../spinner/spinner";
import { useProviderKey } from "@/api/provider-key/query/useProviderKey";
import { useUpsertProviderKey } from "@/api/provider-key/mutation/useUpsertProviderKey";
import { useDeleteProviderKey } from "@/api/provider-key/mutation/useDeleteProviderKey";
import {
  ProviderKeyFormRequest,
  ProviderKeySchema,
} from "@/schemas/provider-key.schema";
import {
  CardWrapper,
  HeaderRow,
  Heading,
  Hint,
  StatusChip,
} from "./provider-key-card.styled";

const PROVIDER = "fal" as const;
const MASKED_KEY = "••••••••••••••••";

export const ProviderKeyCard: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useProviderKey(PROVIDER);
  const upsertMutation = useUpsertProviderKey();
  const deleteMutation = useDeleteProviderKey();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProviderKeyFormRequest>({
    resolver: yupResolver(ProviderKeySchema),
    defaultValues: { key: "" },
  });

  const providerKey = data?.data?.providerKey ?? null;
  const chipState = !providerKey
    ? "none"
    : providerKey.isValid
      ? "active"
      : "invalid";

  const onSubmit = handleSubmit(async ({ key }) => {
    try {
      const response = await upsertMutation.mutateAsync({
        provider: PROVIDER,
        key,
      });
      reset({ key: "" });
      if (response?.data?.providerKey?.isValid) {
        toast.success(t("components.provider_key_card.saved_valid"));
      } else {
        toast.error(t("components.provider_key_card.saved_invalid"));
      }
    } catch {
      toast.error(t("components.provider_key_card.error_saving"));
    }
  });

  const handleRemove = async () => {
    try {
      await deleteMutation.mutateAsync(PROVIDER);
      toast.success(t("components.provider_key_card.removed"));
    } catch {
      toast.error(t("components.provider_key_card.error_removing"));
    }
  };

  return (
    <CardWrapper>
      <HeaderRow>
        <Heading>{t("components.provider_key_card.title")}</Heading>
        {isLoading ? (
          <Spinner />
        ) : (
          <StatusChip $state={chipState}>
            {chipState === "active" && (
              <>
                <FontAwesomeIcon icon={faCheck} />
                {t("components.provider_key_card.status_active")}
              </>
            )}
            {chipState === "invalid" && (
              <>
                <FontAwesomeIcon icon={faXmark} />
                {t("components.provider_key_card.status_invalid")}
              </>
            )}
            {chipState === "none" &&
              t("components.provider_key_card.status_none")}
          </StatusChip>
        )}
      </HeaderRow>

      <Hint>{t("components.provider_key_card.hint")}</Hint>

      <form onSubmit={onSubmit}>
        <Column>
          <Input
            type="password"
            autoComplete="off"
            hideTooltip={!!providerKey}
            placeholder={
              providerKey
                ? MASKED_KEY
                : t("components.provider_key_card.placeholder")
            }
            before={<FontAwesomeIcon icon={faKey} />}
            error={errors.key?.message ? t(errors.key.message) : undefined}
            {...register("key")}
          />
          <Row mt="2" alignItems="center">
            <Button
              type="submit"
              size="sm"
              isLoading={upsertMutation.isLoading}
              before={<FontAwesomeIcon icon={faKey} />}
            >
              {providerKey
                ? t("components.provider_key_card.replace")
                : t("components.provider_key_card.save")}
            </Button>
            {providerKey && (
              <Button
                type="button"
                buttonType="danger"
                transparent
                size="sm"
                ml="2"
                isLoading={deleteMutation.isLoading}
                before={<FontAwesomeIcon icon={faTrash} />}
                onClick={handleRemove}
              >
                {t("components.provider_key_card.remove")}
              </Button>
            )}
          </Row>
        </Column>
      </form>
    </CardWrapper>
  );
};
