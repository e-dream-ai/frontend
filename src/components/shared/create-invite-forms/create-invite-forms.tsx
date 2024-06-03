import { TabList } from "@/components/shared/tabs/tabs";
import { Button, Column, Input } from "@/components/shared";
import { Tab, TabPanel, Tabs } from "react-tabs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faHashtag,
  faTextWidth,
  faTicket,
} from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  InviteByEmailFormValues,
  InviteByEmailSchema,
  InviteCustomCodeFormValues,
  InviteCustomCodeSchema,
} from "@/schemas/invite.schema";
import { useCreateInvite } from "@/api/invites/mutation/useCreateInvite";
import { toast } from "react-toastify";

enum CREATE_INVITE {
  EMAIL = 0,
  CUSTOM = 1,
}

const InviteByEmailForm: React.FC = () => {
  const { t } = useTranslation();

  const { mutateAsync, isLoading } = useCreateInvite();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteByEmailFormValues>({
    resolver: yupResolver(InviteByEmailSchema),
  });

  const onSubmit = async (formData: InviteByEmailFormValues) => {
    try {
      const data = await mutateAsync({
        emails: [formData.email],
        codeLength: formData.codeLength,
      });

      if (data.success) {
        toast.success(t("page.invites.invite_created_successfully"));
        reset();
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
      <Input
        placeholder={t("page.invites.sent_email_email")}
        type="text"
        before={<FontAwesomeIcon icon={faEnvelope} />}
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        placeholder={t("page.invites.sent_email_code_length")}
        type="text"
        before={<FontAwesomeIcon icon={faTextWidth} />}
        error={errors.codeLength?.message}
        {...register("codeLength")}
      />
      <Button type="submit" isLoading={isLoading} size="sm">
        {t("page.invites.generate")}
      </Button>
    </form>
  );
};

const InviteCustomCodeForm: React.FC = () => {
  const { t } = useTranslation();

  const { mutateAsync, isLoading } = useCreateInvite();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteCustomCodeFormValues>({
    resolver: yupResolver(InviteCustomCodeSchema),
  });

  const onSubmit = async (formData: InviteCustomCodeFormValues) => {
    try {
      const data = await mutateAsync({
        code: formData.code,
        size: formData.size,
      });

      if (data.success) {
        toast.success(t("page.invites.invite_created_successfully"));
        reset();
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
        <Input
          placeholder={t("page.invites.custom_code_code")}
          type="text"
          before={<FontAwesomeIcon icon={faHashtag} />}
          error={errors.code?.message}
          {...register("code")}
        />
        <Input
          placeholder={t("page.invites.custom_code_size")}
          type="text"
          before={<FontAwesomeIcon icon={faTicket} />}
          error={errors.size?.message}
          {...register("size")}
        />
        <Button type="submit" isLoading={isLoading} size="sm">
          {t("page.invites.generate")}
        </Button>
      </Column>
    </form>
  );
};

export const CreateInviteForms: React.FC = () => {
  const { t } = useTranslation();

  const [tabIndex, setTabIndex] = useState<CREATE_INVITE>(CREATE_INVITE.EMAIL);

  return (
    <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
      <TabList>
        <Tab tabIndex={`${CREATE_INVITE.EMAIL}`}>
          {t("page.invites.invites_sent_email_tab_title")}
        </Tab>
        <Tab tabIndex={`${CREATE_INVITE.CUSTOM}`}>
          {t("page.invites.invites_custom_code_tab_title")}
        </Tab>
      </TabList>

      <TabPanel tabIndex={CREATE_INVITE.EMAIL}>
        <InviteByEmailForm />
      </TabPanel>

      <TabPanel tabIndex={CREATE_INVITE.CUSTOM}>
        <InviteCustomCodeForm />
      </TabPanel>
    </Tabs>
  );
};

export default CreateInviteForms;
