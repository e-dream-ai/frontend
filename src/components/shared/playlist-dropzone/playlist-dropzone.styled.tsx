import styled from "styled-components";

type StyledPlaylistDropzoneProps = {
  isDragEnter: boolean;
  show: boolean;
};

export const StyledPlaylistDropzone = styled.div<StyledPlaylistDropzoneProps>`
  display: ${(props) => (props.show ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  background-color: ${(props) =>
    props.isDragEnter ? "rgba(255,255,255, 0.1)" : "transparent"};
  border: 1px dashed ${(props) => props.theme.inputText1};
  border-radius: 10px;
  width: 100%;
  min-height: 300px;
`;

export const StyledPlaylistDropzoneContainer = styled.div`
  pointer-events: none;
`;

export const PlaylistDropzoneIcon = styled.span`
  font-size: 4rem;
`;
