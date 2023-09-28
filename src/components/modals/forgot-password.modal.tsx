import { yupResolver } from "@hookform/resolvers/yup";
import useForgotPassword from "api/auth/useForgotPassword";
import { Button, Input, Modal, Row } from "components/shared";
import { ModalsKeys } from "constants/modal.constants";
import { ROUTES } from "constants/routes.constants";
import useModal from "hooks/useModal";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { router } from "routes/router";
import ForgotPasswordSchema, {
  ForgotPasswordFormValues,
} from "schemas/forgot-password.schema";
import { ModalComponent } from "types/modal.types";

export const ForgotPasswordModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
  const { hideModal } = useModal();
  const handleHideModal = () => hideModal(ModalsKeys.FORGOT_PASSWORD_MODAL);
  const { mutate, isLoading } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(ForgotPasswordSchema),
  });

  const onSubmit = (formData: ForgotPasswordFormValues) => {
    mutate(
      { username: formData.username },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Successfully sent instructions.");
            reset();
            handleHideModal();
            router.navigate(ROUTES.CONFIRM_FORGOT_PASSWORD, {
              state: { username: formData.username },
            });
          } else {
            toast.error(`Error sending instructions. ${data.message}`);
          }
        },
        onError: () => {
          toast.error("Error sending instructions.");
        },
      },
    );
  };

  return (
    <Modal
      title="Forgot your password?"
      isOpen={isOpen}
      hideModal={handleHideModal}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Email"
          type="email"
          before={<i className="fa fa-envelope" />}
          error={errors.username?.message}
          {...register("username")}
        />

        <Row justifyContent="flex-end">
          <Button
            type="submit"
            after={<i className="fa fa-angle-right" />}
            isLoading={isLoading}
          >
            Send Instructions
          </Button>
        </Row>
      </form>
    </Modal>
  );
};
