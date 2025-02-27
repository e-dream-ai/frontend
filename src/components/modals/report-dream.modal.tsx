
import { useMemo } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Input, Modal, Row, Select, TextArea } from "@/components/shared";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { CreateReportFormValues, CreateReportSchema } from "@/schemas/create-report.schema";
import { ConfirmModalTypes, ModalComponent } from "@/types/modal.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faFileText, faLink, faWarning } from "@fortawesome/free-solid-svg-icons";
import { useCreateReport } from "@/api/report/mutation/useCreateReport";
import { UNLICENSED_TYPE_ID } from "@/constants/report.constants";
import { useReportTypes } from "@/api/report/query/useReportTypes";
import { Dream } from "@/types/dream.types";

export const ReportDreamModal: React.FC<ModalComponent<ConfirmModalTypes> & { dream: Dream }> = ({ isOpen = false, onCancel, dream }) => {
  const { t } = useTranslation();
  const { mutate, isLoading } = useCreateReport();
  const { data, isLoading: loadingTypes } = useReportTypes()

  const typesOptions = useMemo(() => (data?.data?.reportTypes ?? [])
    .map((f) => ({
      value: f.id,
      label: f.description,
    }))
    , [data]);

  const {
    control,
    formState: { errors },
    register,
    handleSubmit,
    reset,
    watch
  } = useForm<CreateReportFormValues>({
    resolver: yupResolver(CreateReportSchema),
  });

  const watchedType = watch('type');

  const onSubmit = (formData: CreateReportFormValues) => {
    mutate(
      {
        dreamUUID: dream.uuid,
        typeId: formData.type.value,
        comments: formData.comments,
        link: formData.link
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success(
              t("modal.report.report_created_successfully"),
            );
            reset();
            onCancel?.();
          } else {
            toast.error(
              `${t("modal.report.error_creating_report")} ${data.message
              }`,
            );
          }
        },
        onError: () => {
          toast.error(t("modal.report.error_creating_report"));
        },
      },
    );
  };

  return (
    <Modal
      title={t("modal.report.title")}
      size="md"
      isOpen={isOpen}
      hideModal={onCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)}>

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder={t("modal.report.type")}
              isLoading={loadingTypes}
              before={<FontAwesomeIcon icon={faWarning} />}
              options={typesOptions}
              // onChange={handleTypeSelectChange}
              error={errors.type?.label?.message}
              isDisabled={isLoading}
            />
          )}
        />

        <TextArea
          placeholder={t("modal.report.comments")}
          before={<FontAwesomeIcon icon={faFileText} />}
          error={errors.comments?.message}
          {...register("comments")}
        />

        {
          watchedType?.value === UNLICENSED_TYPE_ID && <Input
            placeholder={t("modal.report.link")}
            type="text"
            before={<FontAwesomeIcon icon={faLink} />}
            error={errors.link?.message}
            {...register("link")}
          />
        }

        <Row justifyContent="flex-end">
          <Button
            type="button"
            disabled={isLoading}
            mr="1"
            onClick={onCancel}
          >
            {t("modal.report.cancel")}
          </Button>
          <Button
            type="submit"
            after={<FontAwesomeIcon icon={faAngleRight} />}
            isLoading={isLoading}
          >
            {t("modal.report.report")}
          </Button>
        </Row>
      </form>
    </Modal>
  );
};
