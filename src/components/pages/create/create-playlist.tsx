import { yupResolver } from "@hookform/resolvers/yup";
import { useCreatePlaylist } from "@/api/playlist/mutation/useCreatePlaylist";
import { Button, Input, Row } from "@/components/shared";
import { Column } from "@/components/shared/row/row";
import Text from "@/components/shared/text/text";
import { ROUTES } from "@/constants/routes.constants";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import router from "@/routes/router";
import CreatePlaylistSchema, {
  CreatePlaylistFormValues,
} from "@/schemas/create-playlist.schema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList } from "@fortawesome/free-solid-svg-icons";

export const CreatePlaylist: React.FC = () => {
  const { t } = useTranslation();
  const { mutate: mutateCreatePlaylist, isLoading: isLoadingCreatePlaylist } =
    useCreatePlaylist();
  const {
    register,
    handleSubmit,
    formState: { errors },
    // reset,
  } = useForm<CreatePlaylistFormValues>({
    resolver: yupResolver(CreatePlaylistSchema),
  });

  const onSubmit = (data: CreatePlaylistFormValues) => {
    mutateCreatePlaylist(data, {
      onSuccess: (data) => {
        const playlist = data?.data?.playlist;
        if (data.success) {
          toast.success(t("page.create.playlist_successfully_created"));
          router.navigate(`${ROUTES.VIEW_PLAYLIST}/${playlist?.id}`);
        } else {
          toast.error(
            `${t("page.create.error_creating_playlist")} ${data.message}`,
          );
        }
      },
      onError: () => {
        toast.error(t("page.create.error_creating_playlist"));
      },
    });
  };

  return (
    <>
      <Column>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Text marginY={3}>{t("page.create.playlist_instructions")}</Text>
          <Input
            placeholder={t("page.create.playlist_name")}
            type="text"
            before={<FontAwesomeIcon icon={faList} />}
            error={errors.name?.message}
            {...register("name")}
          />
          <Row mt={1} justifyContent="flex-end">
            <Button isLoading={isLoadingCreatePlaylist}>
              {isLoadingCreatePlaylist
                ? t("page.create.creating")
                : t("page.create.create")}
            </Button>
          </Row>
        </form>
      </Column>
    </>
  );
};
