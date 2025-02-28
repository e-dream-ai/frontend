import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useReports } from "@/api/report/query/useReports";
import { AnchorLink, Button, Column, Row } from "@/components/shared";
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
import { faClipboard, faGears, faLink } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { ROUTES } from "@/constants/routes.constants";
import { useUpdateReport } from "@/api/report/mutation/useUpdateReport";

const List: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return <Ul>{children}</Ul>;
};

const ReportItem: React.FC<{
  report: Report;
}> = ({ report }) => {
  const { state } = useHighlight();
  const { t } = useTranslation();
  const { mutateAsync, isLoading } = useUpdateReport();
  const isNew = state[HighlightKeys.NEW_INVITE] === report.id;

  const handleCopied = () => {
    toast.success(t("components.reports_list.copied"));
  };

  const handleNavigateToUrl = (url: string) => () => {
    window.open(url, "_blank");
  };

  const handleProcessReport = async () => {
    try {
      const data = await mutateAsync({ uuid: report.uuid, values: { processed: true } })

      if (data.success) {
        toast.success(t("components.reports_list.report_processed_successfully"));
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
    <Li isNew={isNew}>
      <Row
        flex="auto"
        margin="0"
        justifyContent="space-between"
        alignItems="center"
      >
        <Column flex={["2"]}>
          <AnchorLink to={`${ROUTES.VIEW_DREAM}/${report.dream.uuid}`} type="secondary">
            {getDreamNameOrUUID(report.dream)}
          </AnchorLink>
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
          <Row>
            <Text>{report?.processed ? t("components.reports_list.yes") : t("components.reports_list.no")}</Text>
            <Button
              data-tooltip-id="navigate-to-url"
              buttonType="tertiary"
              size="sm"
              onClick={handleProcessReport}
              isLoading={isLoading}
              before={<FontAwesomeIcon icon={faGears} />}
            />
          </Row>
        </Column>
        <Column flex={["1"]}>
          <Row m="0">
            <Text mr="1" data-tooltip-id="comments">
              <Tooltip
                id="comments"
                place="right-end"
                content={report.comments}
              />
              {report?.comments ? t("components.reports_list.yes") : t("components.reports_list.no")}
            </Text>
            <CopyToClipboard text={report.link}>
              <Button
                data-tooltip-id="copy-comments"
                buttonType="tertiary"
                size="sm"
                onClick={handleCopied}
                before={<FontAwesomeIcon icon={faClipboard} />}
                mr="1"
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
        <Column flex={["1"]}>
          {report.link ?
            <Row m="0">
              <CopyToClipboard text={report.link}>
                <Button
                  data-tooltip-id="copy-url"
                  buttonType="tertiary"
                  size="sm"
                  onClick={handleCopied}
                  before={<FontAwesomeIcon icon={faClipboard} />}
                  mr="1"
                >
                  <Tooltip
                    id="copy-url"
                    place="right-end"
                    content={t("components.reports_list.copy_url")}
                  />
                </Button>
              </CopyToClipboard>

              <Button
                data-tooltip-id="navigate-to-url"
                buttonType="tertiary"
                size="sm"
                onClick={handleNavigateToUrl(report.link)}
                before={<FontAwesomeIcon icon={faLink} />}
              >
                <Tooltip
                  id="navigate-to-url"
                  place="right-end"
                  content={t("components.reports_list.navigate_url")}
                />
              </Button>
            </Row>
            : <>-</>
          }
        </Column>

      </Row>
    </Li>
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
            <Row justifyContent="space-between">
              <Column flex={["2"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.reports_list.dream")}
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
              <Column flex={["1"]}>
                <Text color={theme.colorSecondary}>
                  {t("components.reports_list.comments")}
                </Text>
              </Column>
              <Column flex={["1"]}>
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
