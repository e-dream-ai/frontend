import { yupResolver } from "@hookform/resolvers/yup";
import { useCreatePlaylist } from "@/api/playlist/mutation/useCreatePlaylist";
import {
  AnchorLink,
  Button,
  FileUploader,
  Input,
  Modal,
  Row,
} from "@/components/shared";
import ProgressBar from "@/components/shared/progress-bar/progress-bar";
import { Column } from "@/components/shared/row/row";
import { TabList } from "@/components/shared/tabs/tabs";
import Text from "@/components/shared/text/text";
import {
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE_MB,
} from "@/constants/file.constants";
import { ModalsKeys } from "@/constants/modal.constants";
import { ROUTES } from "@/constants/routes.constants";
import useModal from "@/hooks/useModal";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Tab, TabPanel, Tabs } from "react-tabs";
import { toast } from "react-toastify";
import router from "@/routes/router";
import CreatePlaylistSchema, {
  CreatePlaylistFormValues,
} from "@/schemas/create-playlist.schema";
import { HandleChangeFile, MultiMediaState } from "@/types/media.types";
import { ModalComponent } from "@/types/modal.types";
import {
  handleFileUploaderSizeError,
  handleFileUploaderTypeError,
} from "@/utils/file-uploader.util";
import { Video } from "./create.styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faUpload } from "@fortawesome/free-solid-svg-icons";
import { useCreatePresignedPost } from "@/api/dream/mutation/useCreatePresignedPost";
import { useConfirmPresignedPost } from "@/api/dream/mutation/useConfirmPresignedPost";
import { useUploadFilePresignedPost } from "@/api/dream/mutation/useUploadFilePresignedPost";
import { useGlobalMutationLoading } from "@/hooks/useGlobalMutationLoading";
import { PresignedPostRequest } from "@/types/dream.types";

enum MODAL_TYPE {
  DREAM = 0,
  PLAYLIST = 1,
}

const MODAL_VALUES = {
  [MODAL_TYPE.DREAM]: {
    TITLE: "modal.create.title",
  },
  [MODAL_TYPE.PLAYLIST]: {
    TITLE: "modal.create.title",
  },
};

export const CreateModal: React.FC<
  ModalComponent<{
    isOpen?: boolean;
  }>
> = ({ isOpen = false }) => {
  const { t } = useTranslation();
  const { hideModal } = useModal();
  const videoRef = useRef(null);
  const [video, setVideo] = useState<MultiMediaState>();
  const [tabIndex, setTabIndex] = useState<MODAL_TYPE>(MODAL_TYPE.DREAM);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleUploadProgress = (value: number) => setUploadProgress(value);

  // const { mutate, isLoading } = useCreateDream({
  //   onChangeUploadProgress: handleUploadProgress,
  // });

  const createPresignedPostMutation = useCreatePresignedPost();
  const uploadFilePresignedPostMutation = useUploadFilePresignedPost({
    onChangeUploadProgress: handleUploadProgress,
  });
  const confirmPresignedPostMutation = useConfirmPresignedPost();

  const isAnyCreateDreamMutationLoading = useGlobalMutationLoading(
    // @ts-expect-error no valid issue
    createPresignedPostMutation,
    uploadFilePresignedPostMutation,
    confirmPresignedPostMutation,
  );

  const { mutate: mutateCreatePlaylist, isLoading: isLoadingCreatePlaylist } =
    useCreatePlaylist();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePlaylistFormValues>({
    resolver: yupResolver(CreatePlaylistSchema),
  });

  const handleHideModal = () => {
    if (isAnyCreateDreamMutationLoading || isLoadingCreatePlaylist) {
      return;
    }
    setVideo(undefined);
    reset();
    hideModal(ModalsKeys.CREATE_MODAL);
  };

  const handleChange: HandleChangeFile = (files) => {
    if (files instanceof FileList) {
      return;
    } else {
      setVideo({ file: files, url: URL.createObjectURL(files) });
    }
  };

  const handleUploadDream = async () => {
    createPresignedPostMutation.mutate(
      {},
      {
        onSuccess: (data) => {
          const presignedPost = data?.data;
          if (data.success) {
            handleUploadVideoDream({
              params: presignedPost,
              file: video?.file,
            });
          } else {
            toast.error(
              `${t("modal.upload_dream.error_creating_dream")} ${data.message}`,
            );
          }
        },
        onError: () => {
          toast.error(t("modal.upload_dream.error_creating_dream"));
        },
      },
    );
  };

  const handleUploadVideoDream = (presignedPost: PresignedPostRequest) => {
    const uuid = presignedPost?.params?.uuid;
    uploadFilePresignedPostMutation.mutate(presignedPost, {
      onSuccess: () => {
        handleConfirmUploadDream(uuid);
      },
      onError: () => {
        toast.error(t("modal.upload_dream.error_creating_dream"));
      },
    });
  };

  const handleConfirmUploadDream = (uuid?: string) => {
    /**
     * Missing name and extension
     */
    confirmPresignedPostMutation.mutate(
      { uuid },
      {
        onSuccess: (data) => {
          const dream = data?.data?.dream;
          if (data.success) {
            toast.success(t("modal.upload_dream.dream_successfully_created"));
            handleHideModal();
            router.navigate(`${ROUTES.VIEW_DREAM}/${dream?.uuid}`);
          } else {
            toast.error(
              `${t("modal.upload_dream.error_creating_dream")} ${data.message}`,
            );
          }
        },
        onError: () => {
          toast.error(t("modal.upload_dream.error_creating_dream"));
        },
      },
    );
  };

  const onSubmit = (data: CreatePlaylistFormValues) => {
    mutateCreatePlaylist(data, {
      onSuccess: (data) => {
        const playlist = data?.data?.playlist;
        if (data.success) {
          toast.success(
            t("modal.create_playlist.playlist_successfully_created"),
          );
          handleHideModal();
          router.navigate(`${ROUTES.VIEW_PLAYLIST}/${playlist?.id}`);
        } else {
          toast.error(
            `${t("modal.create_playlist.error_creating_playlist")} ${
              data.message
            }`,
          );
        }
      },
      onError: () => {
        toast.error(t("modal.create_playlist.error_creating_playlist"));
      },
    });
  };

  return (
    <Modal
      title={t(MODAL_VALUES[tabIndex].TITLE)}
      isOpen={isOpen}
      hideModal={handleHideModal}
      size="md"
    >
      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <TabList>
          <Tab>{t("modal.upload_dream.tab_title")}</Tab>
          <Tab>{t("modal.create_playlist.tab_title")}</Tab>
        </TabList>
        <TabPanel>
          {video ? (
            <Column>
              <Text my={3}>{t("modal.upload_dream.dream_preview")}</Text>
              <Video
                ref={videoRef}
                id="dream"
                controls
                src={video?.url ?? ""}
              />
              <Row mt={1} justifyContent="space-between">
                <Column
                  pr={4}
                  justifyContent="center"
                  style={{ width: "100%" }}
                >
                  {isAnyCreateDreamMutationLoading && (
                    <ProgressBar completed={uploadProgress} />
                  )}
                </Column>

                <Column>
                  <Button
                    after={<FontAwesomeIcon icon={faUpload} />}
                    onClick={handleUploadDream}
                    isLoading={isAnyCreateDreamMutationLoading}
                  >
                    {isAnyCreateDreamMutationLoading
                      ? t("modal.upload_dream.uploading")
                      : t("modal.upload_dream.upload")}
                  </Button>
                </Column>
              </Row>
            </Column>
          ) : (
            <Column>
              <Text marginY={2}>
                {t("modal.upload_dream.dream_instructions")}
              </Text>
              <FileUploader
                maxSize={MAX_FILE_SIZE_MB}
                handleChange={handleChange}
                onSizeError={handleFileUploaderSizeError(t)}
                onTypeError={handleFileUploaderTypeError(t)}
                name="file"
                types={ALLOWED_VIDEO_TYPES}
              />
              <Text mt={4} mb={4}>
                {t("modal.upload_dream.content_policy")} {""}
                <AnchorLink to={ROUTES.TERMS_OF_SERVICE}>
                  {t("modal.upload_dream.terms_of_service")}
                </AnchorLink>
              </Text>
            </Column>
          )}
        </TabPanel>
        <TabPanel>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Column>
              <Text marginY={3}>{t("modal.create_playlist.instructions")}</Text>
              <Input
                placeholder={t("modal.create_playlist.name")}
                type="text"
                before={<FontAwesomeIcon icon={faList} />}
                error={errors.name?.message}
                {...register("name")}
              />
              <Row mt={1} justifyContent="flex-end">
                <Button isLoading={isLoadingCreatePlaylist}>
                  {isLoadingCreatePlaylist
                    ? t("modal.create_playlist.creating")
                    : t("modal.create_playlist.create")}
                </Button>
              </Row>
            </Column>
          </form>
        </TabPanel>
      </Tabs>
    </Modal>
  );
};
