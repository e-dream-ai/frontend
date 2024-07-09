import { useTranslation } from "react-i18next";
import styled from "styled-components";

type FilmstripProps = {
  filmstrip?: string[];
};

const FilmstripItem = styled.img<{ url?: string }>`
  min-width: 300px;
  max-width: 300px;
  height: auto;
  aspect-ratio: 16 / 9;
  background-repeat: no-repeat;
  background-position: left;
  background-size: cover;
  background-image: ${({ url }) => `url(${url})`};
  border: 0;
`;

export const Filmstrip: React.FC<FilmstripProps> = ({ filmstrip }) => {
  const { t } = useTranslation();

  if (!filmstrip?.length) {
    return <>{t("components.filmstrip.empty")}</>;
  }

  return (
    <>
      {filmstrip.map((frame) => (
        <FilmstripItem url={frame} src="/images/blank.gif" />
      ))}
    </>
  );
};
