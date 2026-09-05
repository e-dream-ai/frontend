import { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  DELETE_ACCOUNT_CONFIRMATION,
  useDeleteAccount,
} from "@/api/user/mutation/useDeleteAccount";
import { Avatar } from "@/components/shared/avatar/avatar";
import { Button } from "@/components/shared/button/button";
import { ROUTES } from "@/constants/routes.constants";
import useAuth from "@/hooks/useAuth";
import {
  AccountIdentity,
  CancelButton,
  ConfirmationDialog,
  ConfirmationInput,
  ConfirmationLabel,
  Consequences,
  DeleteAccountTrigger,
  DialogBody,
  DialogFooter,
  DialogTitle,
  ErrorMessage,
  IdentityText,
  Lead,
} from "./delete-account.styled";

const CONSEQUENCE_KEYS = [
  "consequence_access",
  "consequence_email",
  "consequence_data",
] as const;

export const DeleteAccount = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deletion = useDeleteAccount();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [confirmation, setConfirmation] = useState("");

  const isDeleting = deletion.isLoading;
  const isConfirmed = confirmation === DELETE_ACCOUNT_CONFIRMATION;

  const openConfirmation = () => {
    setConfirmation("");
    deletion.reset();
    dialogRef.current?.showModal();
    cancelRef.current?.focus();
  };

  const handleDelete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isConfirmed || isDeleting) return;

    try {
      await deletion.mutateAsync(confirmation);
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
      <DeleteAccountTrigger
        type="button"
        aria-haspopup="dialog"
        onClick={openConfirmation}
      >
        <span>{t("page.profile.delete_account.title")}</span>
      </DeleteAccountTrigger>

      <ConfirmationDialog
        ref={dialogRef}
        aria-labelledby="delete-account-dialog-title"
        aria-describedby="delete-account-description"
        onCancel={(event) => {
          if (isDeleting) event.preventDefault();
        }}
      >
        <form onSubmit={handleDelete} aria-busy={isDeleting}>
          <DialogBody>
            <DialogTitle id="delete-account-dialog-title">
              {t("page.profile.delete_account.confirm_title")}
            </DialogTitle>
            <Lead id="delete-account-description">
              {t("page.profile.delete_account.confirm_description")}
            </Lead>

            <AccountIdentity>
              <Avatar size="sm" url={user?.avatar} />
              <IdentityText>
                <strong>{user?.name || user?.email}</strong>
                {user?.name ? <span>{user.email}</span> : null}
              </IdentityText>
            </AccountIdentity>

            <Consequences>
              {CONSEQUENCE_KEYS.map((key) => (
                <li key={key}>
                  <Trans
                    i18nKey={`page.profile.delete_account.${key}`}
                    components={{ strong: <b /> }}
                  />
                </li>
              ))}
            </Consequences>

            <ConfirmationLabel htmlFor="delete-account-confirmation">
              <Trans
                i18nKey="page.profile.delete_account.confirm_label"
                values={{ keyword: DELETE_ACCOUNT_CONFIRMATION }}
                components={{ keyword: <code /> }}
              />
            </ConfirmationLabel>
            <ConfirmationInput
              id="delete-account-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={isDeleting}
            />

            {deletion.isError ? (
              <ErrorMessage role="alert">
                {t("page.profile.delete_account.error")}
              </ErrorMessage>
            ) : null}
          </DialogBody>

          <DialogFooter>
            <CancelButton
              ref={cancelRef}
              type="button"
              disabled={isDeleting}
              onClick={() => dialogRef.current?.close()}
            >
              {t("page.profile.delete_account.cancel")}
            </CancelButton>
            <Button
              type="submit"
              buttonType="danger"
              disabled={!isConfirmed || isDeleting}
              isLoading={isDeleting}
            >
              {t("page.profile.delete_account.title")}
            </Button>
          </DialogFooter>
        </form>
      </ConfirmationDialog>
    </>
  );
};
