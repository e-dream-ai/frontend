import { Button, Column, Input, Row } from "@/components/shared";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faEnvelope,
  faHashtag,
  faTextWidth,
  faTicket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  InviteByEmailFormValues,
  InviteByEmailSchema,
  InviteCustomCodeFormValues,
  InviteCustomCodeSchema,
} from "@/schemas/invite.schema";
import { useCreateInvite } from "@/api/invites/mutation/useCreateInvite";
import { toast } from "react-toastify";
import Select from "../select/select";
import { useRoles } from "@/api/user/query/useRoles";
import { formatRoleName } from "@/utils/user.util";
import { ROLES } from "@/constants/role.constants";

export const InviteByEmailForm: React.FC<{ onSucess?: () => void }> = ({
  onSucess,
}) => {
  const { t } = useTranslation();
  const [roleSearch, setRoleSearch] = useState<string>("");

  const { mutateAsync, isLoading } = useCreateInvite();

  const { data: rolesData, isLoading: isRolesLoading } = useRoles({
    search: roleSearch,
  });

  const rolesOptions = useMemo(() => {
    return (
      (rolesData?.data?.roles ?? [])
        .filter((role) => role.name)
        /**
         * filter roles to exclude ADMIN_GROUP
         */
        .filter((role) => role.name !== ROLES.ADMIN_GROUP)
        .map((role) => ({
          label: formatRoleName(role?.name),
          value: role?.id,
        }))
    );
  }, [rolesData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<InviteByEmailFormValues>({
    resolver: yupResolver(InviteByEmailSchema),
  });

  useEffect(() => {
    const defaultRole = rolesOptions.find(
      (role) => role.label === formatRoleName(ROLES.USER_GROUP),
    );

    reset({ role: defaultRole });
  }, [reset, rolesOptions]);

  const onSubmit = async (formData: InviteByEmailFormValues) => {
    try {
      const data = await mutateAsync({
        email: formData.email,
        codeLength:
          formData.codeLength !== null ? formData.codeLength : undefined,
        roleId: formData?.role?.value,
      });

      if (data.success) {
        toast.success(t("page.invites.invite_created_successfully"));
        reset();
        onSucess?.();
      } else {
        toast.error(
          `${t("page.invites.error_creating_invite")} ${data.message}`,
        );
      }
    } catch (error) {
      toast.error(t("page.invites.error_creating_invite"));
    }
  };

  return (
    <form id="invite-by-email" onSubmit={handleSubmit(onSubmit)}>
      <Column>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder={t("page.invites.signup_role")}
              isLoading={isRolesLoading}
              before={<FontAwesomeIcon icon={faUser} />}
              options={rolesOptions}
              onInputChange={(newValue) => setRoleSearch(newValue)}
              error={errors.role?.label?.message}
            />
          )}
        />
        <Input
          placeholder={t("page.invites.sent_email_email")}
          type="text"
          before={<FontAwesomeIcon icon={faEnvelope} />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          placeholder={t("page.invites.sent_email_code_length")}
          type="number"
          before={<FontAwesomeIcon icon={faTextWidth} />}
          error={errors.codeLength?.message}
          {...register("codeLength")}
        />
      </Column>
      <Row justifyContent="flex-end">
        <Button
          type="submit"
          isLoading={isLoading}
          after={<FontAwesomeIcon icon={faAngleRight} />}
        >
          {t("page.invites.create")}
        </Button>
      </Row>
    </form>
  );
};

export const InviteCustomCodeForm: React.FC<{ onSucess?: () => void }> = ({
  onSucess,
}) => {
  const { t } = useTranslation();
  const [roleSearch, setRoleSearch] = useState<string>("");
  const { mutateAsync, isLoading } = useCreateInvite();

  const { data: rolesData, isLoading: isRolesLoading } = useRoles({
    search: roleSearch,
  });

  const rolesOptions = useMemo(() => {
    return (
      (rolesData?.data?.roles ?? [])
        .filter((role) => role.name)
        /**
         * filter roles to exclude ADMIN_GROUP
         */
        .filter((role) => role.name !== ROLES.ADMIN_GROUP)
        .map((role) => ({
          label: formatRoleName(role?.name),
          value: role?.id,
        }))
    );
  }, [rolesData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<InviteCustomCodeFormValues>({
    resolver: yupResolver(InviteCustomCodeSchema),
  });

  useEffect(() => {
    const defaultRole = rolesOptions.find(
      (role) => role.label === formatRoleName(ROLES.USER_GROUP),
    );

    reset({ role: defaultRole });
  }, [reset, rolesOptions]);

  const onSubmit = async (formData: InviteCustomCodeFormValues) => {
    try {
      const data = await mutateAsync({
        code: formData.code,
        size: formData.size,
        roleId: formData?.role?.value,
      });

      if (data.success) {
        toast.success(t("page.invites.invite_created_successfully"));
        reset();
        onSucess?.();
      } else {
        toast.error(
          `${t("page.invites.error_creating_invite")} ${data.message}`,
        );
      }
    } catch (error) {
      toast.error(t("page.invites.error_creating_invite"));
    }
  };

  return (
    <form id="invite-custom-code" onSubmit={handleSubmit(onSubmit)}>
      <Column>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder={t("page.invites.signup_role")}
              isLoading={isRolesLoading}
              before={<FontAwesomeIcon icon={faUser} />}
              options={rolesOptions}
              onInputChange={(newValue) => setRoleSearch(newValue)}
              error={errors.role?.label?.message}
            />
          )}
        />
        <Input
          placeholder={t("page.invites.custom_code_code")}
          type="text"
          before={<FontAwesomeIcon icon={faHashtag} />}
          error={errors.code?.message}
          {...register("code")}
        />
        <Input
          placeholder={t("page.invites.custom_code_size")}
          type="number"
          before={<FontAwesomeIcon icon={faTicket} />}
          error={errors.size?.message}
          {...register("size")}
        />
      </Column>

      <Row justifyContent="flex-end">
        <Button
          type="submit"
          isLoading={isLoading}
          after={<FontAwesomeIcon icon={faAngleRight} />}
        >
          {t("page.invites.create")}
        </Button>
      </Row>
    </form>
  );
};
