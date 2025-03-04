import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useReports } from "@/api/report/query/useReports";
import { Anchor, AnchorLink, Button, Column, Row } from "@/components/shared";
import { Paginate } from "@/components/shared/paginate/paginate";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { PAGINATION } from "@/constants/pagination.constants";
import { Report } from "@/types/report.types";
import { Ul, Li } from "@/components/shared/list/list.styled";
import { useTheme } from "styled-components";
import useHighlight from "@/hooks/useHighlight";
import { HighlightKeys } from "@/constants/highlight.constants";
import { getUserNameOrEmail } from "@/utils/user.util";
import { getDreamNameOrUUID } from "@/utils/dream.util";
import moment from "moment";
import { SHORT_FORMAT } from "@/constants/moment.constants";
import CopyToClipboard from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "react-tooltip";
import { faClipboard, faGears } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { ROUTES } from "@/constants/routes.constants";
import { useUpdateReport } from "@/api/report/mutation/useUpdateReport";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { truncateString, truncateWords } from "@/utils/string.util";
import { TYPES } from "@/constants/report.constants";

const List: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return <Ul>{children}</Ul>;
};

const GAP = "1rem";

const ReportItem: React.FC<{
  report: Report;
}> = ({ report }) => {
  const { state } = useHighlight();
  const { t } = useTranslation();
  const [showConfirmProcessModal, setShowConfirmProcessModal] =
    useState<boolean>(false);
  const { mutateAsync, isLoading: isProcessingReport } = useUpdateReport();
  const isNew = state[HighlightKeys.NEW_INVITE] === report.id;

  const onShowConfirmProcessModal = () => setShowConfirmProcessModal(true);
  const onHideConfirmProcessModal = () => setShowConfirmProcessModal(false);

  const handleCopied = () => {
    toast.success(t("components.reports_list.copied"));
  };

  const handleProcessReport = async () => {
    try {
      const data = await mutateAsync({ uuid: report.uuid, values: { processed: true } })

      if (data.success) {
        toast.success(t("components.reports_list.report_processed_successfully"));
        onHideConfirmProcessModal();
      } else {
        toast.error(
          `${t("components.reports_list.error_processing_report")} ${data.message}`,
        );
      }
    } catch (error) {
      toast.error(t("components.reports_list.error_processing_report"));
    }
  }

  return (
    <>
      {/**
       * Confirm process report modal
       */}
      <ConfirmModal
        isOpen={showConfirmProcessModal}
        onCancel={onHideConfirmProcessModal}
        onConfirm={handleProcessReport}
        isConfirming={isProcessingReport}
        title={t("components.reports_list.confirm_process_report_title")}
        text={
          <Text>
            {t("components.reports_list.confirm_process_report")}{" "}
            <em>
              <strong>{truncateString(report.dream?.name, 20)}</strong>
            </em>
          </Text>
        }
      />

      <Li isNew={isNew}>
        <Row
          flex="auto"
          margin="0"
          justifyContent="space-between"
          alignItems="center"
          style={{ gap: GAP }}
        >

          <Column flex={["3"]}>
            <AnchorLink to={`${ROUTES.VIEW_DREAM}/${report.dream.uuid}`} type="secondary">
              {truncateString(getDreamNameOrUUID(report.dream), 20)}
            </AnchorLink>
          </Column>
          <Column flex={["1"]}>
            <Text>
              {TYPES[report?.type?.id].short ?? 'Other'}
            </Text>
          </Column>
          <Column flex={["1"]}>
            <AnchorLink to={`${ROUTES.PROFILE}/${report.reportedBy?.uuid}`} type="secondary">
              {getUserNameOrEmail(report?.reportedBy)}
            </AnchorLink>
          </Column>
          <Column flex={["1"]}>
            <Text>{moment(report?.reportedAt).format(SHORT_FORMAT)}</Text>
          </Column>
          <Column flex={["1"]}>
            <Row m="0" alignItems="center">
              {
                report?.processed
                  ? <Text mr="2">{t("components.reports_list.yes")}</Text>
                  : <Button
                    data-tooltip-id="navigate-to-url"
                    buttonType="tertiary"
                    size="sm"
                    onClick={onShowConfirmProcessModal}
                    isLoading={isProcessingReport}
                    before={<FontAwesomeIcon icon={faGears} />}
                  />
              }
            </Row>
          </Column>
          <Column flex={["2"]}>
            <Row m="0" alignItems="center" justifyContent="space-between">
              <Text mr="1" data-tooltip-id={`comments-${report.uuid}`}>
                <Tooltip
                  id={`comments-${report.uuid}`}
                  place="right-end"
                  content={`${t("components.reports_list.comments")}: ${report.comments ?? ""}`}
                />
                {truncateWords(report.comments, 10)}
              </Text>
              <CopyToClipboard text={report.comments}>
                <Button
                  data-tooltip-id="copy-comments"
                  buttonType="tertiary"
                  size="sm"
                  onClick={handleCopied}
                  before={<FontAwesomeIcon icon={faClipboard} />}
                >
                  <Tooltip
                    id="copy-comments"
                    place="right-end"
                    content={t("components.reports_list.copy_comments")}
                  />
                </Button>
              </CopyToClipboard>
            </Row>
          </Column>
          <Column flex={["3"]}>
            {report.link ?
              <Row m="0">
                <Anchor type="secondary" href={report.link}>{truncateString(report.link, 20)}</Anchor>
              </Row>
              : <>{t("components.reports_list.no")}</>
            }
          </Column>

        </Row>
      </Li>
    </>
  );
};

export const ReportsList: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isRefetching } = useReports({
    page,
  });
  const reports = data?.data?.reports;
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
        ) : reports?.length ? (
          <>
            <Row justifyContent="space-between" style={{ gap: GAP }}>
              <Column flex={["3"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.reports_list.dream")}
                </Text>
              </Column>
              <Column flex={["1"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.reports_list.type")}
                </Text>
              </Column>
              <Column flex={["1"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.reports_list.reported_by")}
                </Text>
              </Column>
              <Column flex={["1"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.reports_list.reported_at")}
                </Text>
              </Column>
              <Column flex={["1"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.reports_list.processed")}
                </Text>
              </Column>
              <Column flex={["2"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.reports_list.comments")}
                </Text>
              </Column>
              <Column flex={["3"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.reports_list.link")}
                </Text>
              </Column>
            </Row>
            <List>
              {reports?.map((report: Report) => (
                <ReportItem key={report?.id} report={report} />
              ))}
            </List>
          </>
        ) : (
          <Text>{t("components.reports_list.empty")}</Text>
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

export default ReportsList;
