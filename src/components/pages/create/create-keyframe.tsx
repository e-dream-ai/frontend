import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  faImage,
  faList,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { useCreateKeyframe } from "@/api/keyframe/mutation/useCreateKeyframe";
import {
  AnchorLink,
  Button,
  FileUploader,
  Input,
  Row,
} from "@/components/shared";
import { Column } from "@/components/shared/row/row";
import Text from "@/components/shared/text/text";
import { ROUTES } from "@/constants/routes.constants";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CreateKeyframeSchema, {
  CreateKeyframeFormValues,
} from "@/schemas/create-keyframe.schema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAddPlaylistKeyframe } from "@/api/playlist/mutation/useAddPlaylistKeyframe";
import Select from "@/components/shared/select/select";
import { usePlaylists } from "@/api/playlist/query/usePlaylists";
import useAuth from "@/hooks/useAuth";
import { isAdmin } from "@/utils/user.util";
import { User } from "@/types/auth.types";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_FILE_SIZE_MB } from "@/constants/file.constants";
import { useUpdateImageKeyframe } from "@/api/keyframe/mutation/useUpdateImageKeyframe";
import { handleFileUploaderSizeError, handleFileUploaderTypeError } from "@/utils/file-uploader.util";
import { HandleChangeFile, MultiMediaState } from "@/types/media.types";
import { ItemCardImage } from "@/components/shared/item-card/item-card.styled";
import router from "@/routes/router";
import { useSearchParams } from "react-router-dom";
import { PLAYLIST_QUERY_KEY, usePlaylist } from "@/api/playlist/query/usePlaylist";
import queryClient from "@/api/query-client";

export const CreateKeyframe: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const [playlistSearch, setPlaylistSearch] = useState<string>("");
  const [image, setImage] = useState<MultiMediaState>();
  const hasSetDefaultPlaylistValue = useRef(false);


  /**
   * Default playlist from navigation
   */
  const defaultPlaylistUUID = params.get("playlist") ?? undefined;
  const defaultPlaylistQuery = usePlaylist(defaultPlaylistUUID);


  const {
    mutateAsync: mutateCreateKeyframe,
    isLoading: isLoadingCreateKeyframe,
  } = useCreateKeyframe();

  const updateImageKeyframeMutation = useUpdateImageKeyframe();

  const addKeyframeItemMutation = useAddPlaylistKeyframe();

  /**
   * playlists options data
   */

  const { data: playlistsData, isLoading: isPlaylistsLoading } = usePlaylists({
    search: playlistSearch,
    scope: isUserAdmin ? "all-on-search" : "user-only",
  });

  /**
   * Select playlists options
   */
  const playlistsOptions = useMemo(() => {
    const options = (playlistsData?.data?.playlists ?? [])
      .filter((playlist) => playlist.name)
      .map((playlist) => ({
        label: playlist?.name ?? "-",
        value: playlist?.uuid,
      }));

    return options;
  }, [playlistsData]);

  const isLoading =
    updateImageKeyframeMutation.isLoading
    || isLoadingCreateKeyframe
    || addKeyframeItemMutation.isLoading;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateKeyframeFormValues>({
    resolver: yupResolver(CreateKeyframeSchema),
  });

  const handleFileUploaderChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setImage({ file: files, url: URL.createObjectURL(files) });
    }
  };

  const handleCancel = async () => {
    setImage(undefined);
    toast.success(
      `${t("page.create.keyframe_upload_cancelled_successfully")}`,
    );
  };

  const onSubmit = async (data: CreateKeyframeFormValues) => {
    try {
      const createKeyframeRequest = await mutateCreateKeyframe({
        name: data.name
      });

      const newKeyframe = createKeyframeRequest?.data?.keyframe;
      const playlistUUID = data.playlist.value;

      if (image) {
        await updateImageKeyframeMutation.updateImageKeyframe(newKeyframe!.uuid, image!.file);
      }

      if (data.playlist) {
        await addKeyframeItemMutation.mutateAsync({
          uuid: playlistUUID, values: {
            uuid: newKeyframe!.uuid
          }
        });

        queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, playlistUUID]);
      }

      router.navigate(`${ROUTES.VIEW_KEYFRAME}/${newKeyframe!.uuid}`);
      toast.success("page.create.keyframe_successfully_created");
    } catch (error) {
      toast.error(t("page.create.error_creating_keyframe"));
    }
  };

  /**
   * Sets default playlist if there's a value from navigation
   */
  useEffect(() => {
    if (
      defaultPlaylistQuery.isFetched &&
      defaultPlaylistQuery.data?.data?.playlist &&
      !hasSetDefaultPlaylistValue.current
    ) {
      const dp = defaultPlaylistQuery.data.data.playlist;
      setValue("playlist", {
        label: dp.name,
        value: dp.uuid,
      });
      hasSetDefaultPlaylistValue.current = true;
    } else if (!defaultPlaylistQuery.isLoading) {
      hasSetDefaultPlaylistValue.current = true;
    }
  }, [setValue, defaultPlaylistQuery]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Column>

        <Text marginY={3}>{t("page.create.keyframe_instructions")}</Text>

        <Input
          placeholder={t("page.create.keyframe_name")}
          type="text"
          before={<FontAwesomeIcon icon={faImage} />}
          error={errors.name?.message}
          {...register("name")}
        />

        <Controller
          name="playlist"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder={t("page.create.playlist")}
              isLoading={isPlaylistsLoading}
              before={<FontAwesomeIcon icon={faList} />}
              options={playlistsOptions}
              onInputChange={(newValue) => setPlaylistSearch(newValue)}
              // onChange={handlePlaylistSelectChange}
              error={errors.playlist?.label?.message}
              isDisabled={isLoading}
            />
          )}
        />

        {image ? (
          <>
            <Text my={3}>{t("page.create.keyframe_preview")}</Text>
            <ItemCardImage id="keyframe" size="lg" src={image?.url ?? ""} />
          </>
        ) : (
          <>
            <Text my={3}>{t("page.create.keyframe_file_instructions")}</Text>
            <FileUploader
              maxSize={MAX_IMAGE_FILE_SIZE_MB}
              handleChange={handleFileUploaderChange}
              onSizeError={handleFileUploaderSizeError(t)}
              onTypeError={handleFileUploaderTypeError(t)}
              name="file"
              types={ALLOWED_IMAGE_TYPES}
            />
          </>
        )}

        <Row mt={4} justifyContent="flex-end">
          {Boolean(image) && (
            <Button
              type="button"
              mr={2}
              disabled={isLoading}
              onClick={handleCancel}
            >
              {t("page.create.cancel")}
            </Button>
          )}

          <Button
            isLoading={isLoading}
            after={<FontAwesomeIcon icon={faUpload} />}
            disabled={isLoading}
          >
            {isLoading ? t("page.create.creating") : t("page.create.create")}
          </Button>
        </Row>

        <Row my={4}>
          <Text>
            {t("page.create.content_policy")} {""}
            <AnchorLink
              style={{ textDecoration: "underline" }}
              to={ROUTES.TERMS_OF_SERVICE}
            >
              {t("page.create.terms_of_service")}
            </AnchorLink>
            .
          </Text>
        </Row>
      </Column>
    </form>
  );
};
