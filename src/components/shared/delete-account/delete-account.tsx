import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useDeleteAccount } from "@/api/user/mutation/useDeleteAccount";
import { Avatar } from "@/components/shared/avatar/avatar";
import { Button } from "@/components/shared/button/button";
import { ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import {
  AccountIdentity,
  ConfirmationDialog,
  DialogBody,
  DialogFooter,
  DialogTitle,
  ErrorMessage,
  IdentityText,
} from "./delete-account.styled";

export const DeleteAccount = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deletion = useDeleteAccount();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const isDeleting = deletion.isLoading;

  const openConfirmation = () => {
    deletion.reset();
    dialogRef.current?.showModal();
    cancelRef.current?.focus();
  };

  const handleDelete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDeleting) return;

    try {
      await deletion.mutateAsync();
    } catch {
      return;
    }

    dialogRef.current?.close();
    await queryClient.cancelQueries();
    await logout({ callFetchLogout: false });
    queryClient.clear();
    navigate(ROUTES.ROOT, { replace: true });
    toast.success(t("page.profile.delete_account.success"));
  };

  return (
    <>
      <Button
        buttonType="danger"
        aria-haspopup="dialog"
        onClick={openConfirmation}
      >
        {t("page.profile.delete_account.title")}
      </Button>

      <ConfirmationDialog
        ref={dialogRef}
        aria-labelledby="delete-account-dialog-title"
        onCancel={(event) => {
          if (isDeleting) event.preventDefault();
        }}
      >
        <form onSubmit={handleDelete} aria-busy={isDeleting}>
          <DialogBody>
            <DialogTitle id="delete-account-dialog-title">
              {t("page.profile.delete_account.confirm_title")}
            </DialogTitle>

            <AccountIdentity>
              <Avatar size="sm" url={user?.avatar} />
              <IdentityText>
                <strong>{user?.name || user?.email}</strong>
                {user?.name ? <span>{user.email}</span> : null}
              </IdentityText>
            </AccountIdentity>

            {deletion.isError ? (
              <ErrorMessage role="alert">
                {t("page.profile.delete_account.error")}
              </ErrorMessage>
            ) : null}
          </DialogBody>

          <DialogFooter>
            <Button
              ref={cancelRef}
              type="button"
              buttonType="primary"
              disabled={isDeleting}
              onClick={() => dialogRef.current?.close()}
            >
              {t("page.profile.delete_account.cancel")}
            </Button>
            <Button
              type="submit"
              buttonType="danger"
              disabled={isDeleting}
              isLoading={isDeleting}
            >
              {t("page.profile.delete_account.confirm_button")}
            </Button>
          </DialogFooter>
        </form>
      </ConfirmationDialog>
    </>
  );
};
