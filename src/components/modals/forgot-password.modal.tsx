import { yupResolver } from "@hookform/resolvers/yup";
import useCreatePasswordReset from "@/api/auth/useCreatePasswordReset";
import { Button, Input, Modal, Row } from "@/components/shared";
import { ModalsKeys } from "@/constants/modal.constants";
import useModal from "@/hooks/useModal";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  CreatePasswordResetSchema,
  CreatePasswordResetFormValues,
} from "@/schemas/forgot-password.schema";
import { ModalComponent } from "@/types/modal.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faEnvelope } from "@fortawesome/free-solid-svg-icons";

export const ForgotPasswordModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
  const { t } = useTranslation();
  const { hideModal } = useModal();
  const handleHideModal = () => hideModal(ModalsKeys.FORGOT_PASSWORD_MODAL);
  const { mutate, isLoading } = useCreatePasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePasswordResetFormValues>({
    resolver: yupResolver(CreatePasswordResetSchema),
  });

  const onSubmit = (formData: CreatePasswordResetFormValues) => {
    mutate(
      { email: formData.email },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(
              t("modal.forgot_password.sent_instructions_successfully"),
            );
            reset();
            handleHideModal();
          } else {
            toast.error(
              `${t("modal.forgot_password.error_sending_instructions")} ${
                data.message
              }`,
            );
          }
        },
        onError: () => {
          toast.error(t("modal.forgot_password.error_sending_instructions"));
        },
      },
    );
  };

  return (
    <Modal
      title={t("modal.forgot_password.title")}
      isOpen={isOpen}
      hideModal={handleHideModal}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder={t("modal.forgot_password.email")}
          type="email"
          before={<FontAwesomeIcon icon={faEnvelope} />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Row justifyContent="flex-end">
          <Button
            type="submit"
            after={<FontAwesomeIcon icon={faAngleRight} />}
            isLoading={isLoading}
          >
            {t("modal.forgot_password.send")}
          </Button>
        </Row>
      </form>
    </Modal>
  );
};
