import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useInvites } from "@/api/invites/query/useInvites";
import { Button, Column, Row } from "@/components/shared";
import { Paginate } from "@/components/shared/paginate/paginate";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { PAGINATION } from "@/constants/pagination.constants";
import { Invite } from "@/types/invite.types";
import { useInvalidateInvite } from "@/api/invites/mutation/useInvalidateInvite";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faEraser } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { Ul, Li } from "@/components/shared/list/list.styled";
import { useTheme } from "styled-components";
import { formatRoleName } from "@/utils/user.util";
import useHighlight from "@/hooks/useHighlight";
import { HighlightKeys } from "@/constants/highlight.constants";

const List: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return <Ul>{children}</Ul>;
};

const InviteItem: React.FC<{
  invite: Invite;
}> = ({ invite }) => {
  const { t } = useTranslation();
  const { mutateAsync } = useInvalidateInvite(invite.id);
  const { state } = useHighlight();
  const isNew = state[HighlightKeys.NEW_INVITE] === invite.id;

  const handleCopySignupUrl = () => {
    toast.success(t("components.invites_list.signup_url_copied_successfully"));
  };

  const handleInvalidateInvite = async () => {
    try {
      const response = await mutateAsync();
      if (response?.success) {
        toast.success(
          `${t("components.invites_list.invite_invalidated_successfully")}`,
        );
      } else {
        toast.error(
          `${t("components.invites_list.error_invalidating_invite")}`,
        );
      }
    } catch (_) {
      toast.error(`${t("components.invites_list.error_invalidating_invite")}`);
    }
  };

  return (
    <Li isNew={isNew}>
      <Row
        flex="auto"
        margin="0"
        justifyContent="space-between"
        alignItems="center"
      >
        <Column flex={["2"]}>
          <Text>{invite?.code}</Text>
        </Column>
        <Column flex={["1"]}>
          <Text>{invite?.size}</Text>
        </Column>
        <Column flex={["1"]}>
          <Text>{formatRoleName(invite?.signupRole?.name)}</Text>
        </Column>
        <Column flex={["1"]} alignItems="flex-end">
          <Row margin="0">
            <CopyToClipboard text={invite?.signupUrl}>
              <Button
                data-tooltip-id="copy-invite-url"
                buttonType="tertiary"
                size="sm"
                onClick={handleCopySignupUrl}
                before={<FontAwesomeIcon icon={faClipboard} />}
                mr="3"
              >
                <Tooltip
                  id="copy-invite-url"
                  place="right-end"
                  content={t("components.invites_list.copy_signup_url")}
                />
              </Button>
            </CopyToClipboard>

            <Button
              data-tooltip-id="invalidate-invite"
              buttonType="danger"
              size="sm"
              onClick={handleInvalidateInvite}
              before={<FontAwesomeIcon icon={faEraser} />}
            >
              <Tooltip
                id="invalidate-invite"
                place="right-end"
                content={t("components.invites_list.invalidate_invite")}
              />
            </Button>
          </Row>
        </Column>
      </Row>
    </Li>
  );
};

export const InvitesList: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isRefetching } = useInvites({
    page,
  });
  const invites = data?.data?.invites;
  const pageCount = Math.ceil((data?.data?.count ?? 1) / PAGINATION.TAKE);
  const handleonPageChange = ({ selected }: { selected: number }) => {
    setPage(selected);
  };

  return (
    <Row flex="auto">
      <Column flex="auto">
        {isLoading || isRefetching ? (
          <Row justifyContent="center">
            <Spinner />
          </Row>
        ) : invites?.length ? (
          <>
            <Row justifyContent="space-between">
              <Column flex={["2"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.invites_list.code")}
                </Text>
              </Column>
              <Column flex={["1"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.invites_list.size")}
                </Text>
              </Column>
              <Column flex={["1"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.invites_list.role")}
                </Text>
              </Column>
              <Column flex={["1"]} alignItems="flex-end"></Column>
            </Row>
            <List>
              {invites?.map((invite) => (
                <InviteItem key={invite?.id} invite={invite} />
              ))}
            </List>
          </>
        ) : (
          <Text>{t("components.invites_list.empty")}</Text>
        )}

        <Row justifyContent="center" margin="0">
          <Paginate
            breakLabel="..."
            nextLabel={`${t("components.paginate.next")} >`}
            onPageChange={handleonPageChange}
            pageCount={pageCount}
            previousLabel={`< ${t("components.paginate.previous")}`}
            renderOnZeroPageCount={null}
          />
        </Row>
      </Column>
    </Row>
  );
};

export default InvitesList;
