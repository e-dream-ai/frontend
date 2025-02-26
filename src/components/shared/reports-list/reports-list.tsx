import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useReports } from "@/api/report/query/useReports";
import { Column, Row } from "@/components/shared";
import { Paginate } from "@/components/shared/paginate/paginate";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { PAGINATION } from "@/constants/pagination.constants";
import { Report } from "@/types/report.types";
import { Ul, Li } from "@/components/shared/list/list.styled";
import { useTheme } from "styled-components";
import useHighlight from "@/hooks/useHighlight";
import { HighlightKeys } from "@/constants/highlight.constants";

const List: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return <Ul>{children}</Ul>;
};

const ReportItem: React.FC<{
  report: Report;
}> = ({ report }) => {
  const { state } = useHighlight();
  const isNew = state[HighlightKeys.NEW_INVITE] === report.id;

  return (
    <Li isNew={isNew}>
      <Row
        flex="auto"
        margin="0"
        justifyContent="space-between"
        alignItems="center"
      >
        <Column flex={["2"]}>
          <Text>{report?.dream?.name}</Text>
        </Column>
        <Column flex={["1"]}>
          <Text>{report?.reportedBy?.name}</Text>
        </Column>
        <Column flex={["1"]}>
          <Text>{report?.reportedAt}</Text>
        </Column>
        <Column flex={["1"]}>
          <Text>{report?.processed}</Text>
        </Column>
        <Column flex={["1"]}>
          <Text>{report?.comments}</Text>
        </Column>
        <Column flex={["1"]}>
          <Text>{report?.link}</Text>
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
              <Column flex={["1"]} alignItems="flex-end"></Column>
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
