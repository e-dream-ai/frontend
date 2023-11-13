import { yupResolver } from "@hookform/resolvers/yup";
import { useCreateDream } from "api/dream/mutation/useCreateDream";
import { useCreatePlaylist } from "api/playlist/mutation/useCreatePlaylist";
import { Button, Input, Modal, Row } from "components/shared";
import { Column } from "components/shared/row/row";
import { TabList } from "components/shared/tabs/tabs";
import Text from "components/shared/text/text";
import { MAX_FILE_SIZE_MB } from "constants/file.constants";
import { ModalsKeys } from "constants/modal.constants";
import { ROUTES } from "constants/routes.constants";
import useModal from "hooks/useModal";
import { useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Tab, TabPanel, Tabs } from "react-tabs";
import { toast } from "react-toastify";
import router from "routes/router";
import CreatePlaylistSchema, {
  CreatePlaylistFormValues,
} from "schemas/create-playlist.schema";
import { ModalComponent } from "types/modal.types";
import {
  handleFileUploaderSizeError,
  handleFileUploaderTypeError,
} from "utils/file-uploader.util";
import { Video } from "./create.styled";

type VideoState =
  | {
      fileBlob: Blob;
      url: string;
    }
  | undefined;

const fileTypes = ["MP4"];

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
  const [video, setVideo] = useState<VideoState>();
  const videoRef = useRef(null);
  const [tabIndex, setTabIndex] = useState<MODAL_TYPE>(MODAL_TYPE.DREAM);
  const { mutate, isLoading } = useCreateDream();
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
    if (isLoading || isLoadingCreatePlaylist) {
      return;
    }
    setVideo(undefined);
    reset();
    hideModal(ModalsKeys.CREATE_MODAL);
  };

  const handleChange = (file: Blob) => {
    setVideo({ fileBlob: file, url: URL.createObjectURL(file) });
  };

  const handleUpload = async () => {
    mutate(
      { file: video?.fileBlob },
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
              <Text>{t("modal.upload_dream.dream_preview")}</Text>
              <Video
                ref={videoRef}
                id="dream"
                controls
                src={video?.url ?? ""}
              />
              <Row mt={1} justifyContent="flex-end">
                <Button
                  after={<i className="fa fa-upload" />}
                  onClick={handleUpload}
                  isLoading={isLoading}
                >
                  {isLoading
                    ? t("modal.upload_dream.uploading")
                    : t("modal.upload_dream.upload")}
                </Button>
              </Row>
            </Column>
          ) : (
            <Column>
              <Text marginY={2}>
                {t("modal.upload_dream.dream_instructions")}
              </Text>
              <Row mt={1} justifyContent="center">
                <FileUploader
                  maxSize={MAX_FILE_SIZE_MB}
                  handleChange={handleChange}
                  onSizeError={handleFileUploaderSizeError(t)}
                  onTypeError={handleFileUploaderTypeError(t)}
                  name="file"
                  types={fileTypes}
                />
              </Row>
            </Column>
          )}
        </TabPanel>
        <TabPanel>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Column>
              <Text marginY={2}>{t("modal.create_playlist.instructions")}</Text>
              <Input
                placeholder={t("modal.create_playlist.name")}
                type="text"
                before={<i className="fa fa-list" />}
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
