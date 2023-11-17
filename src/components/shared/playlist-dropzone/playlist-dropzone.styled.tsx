import styled from "styled-components";

type StyledPlaylistDropzoneProps = {
  isDragEnter: boolean;
  show: boolean;
};

export const StyledPlaylistDropzone = styled.div<StyledPlaylistDropzoneProps>`
  display: ${(props) => (props.show ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: ${(props) =>
    props.isDragEnter ? props.theme.inputBackgroundColor : "transparent"};
  border: 1px dashed ${(props) => props.theme.inputTextColorPrimary};
  border-radius: 5px;
  width: 100%;
  min-height: 300px;
`;

export const StyledPlaylistDropzoneContainer = styled.div`
  pointer-events: none;
`;

export const PlaylistDropzoneIcon = styled.span`
  font-size: 4rem;
`;
