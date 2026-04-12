import styled from "styled-components";

export const CombinationGrid = styled.div`
  overflow-x: auto;
  margin-bottom: 1.5rem;
`;

export const GridTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
`;

export const GridHeader = styled.th`
  padding: 0.5rem;
  text-align: center;
  font-weight: 500;
  color: ${(props) => props.theme.textBodyColor};
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GridRowHeader = styled.td`
  padding: 0.5rem;
  font-weight: 500;
  color: ${(props) => props.theme.textBodyColor};
  border-right: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  min-width: 100px;
`;

export const GridCell = styled.td<{ $excluded?: boolean }>`
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  opacity: ${(props) => (props.$excluded ? 0.4 : 1)};
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.colorBackgroundQuaternary};
  }
`;

export const CellThumb = styled.img`
  width: 60px;
  height: 34px;
  object-fit: cover;
  border-radius: 4px;
`;

export const CellCheckbox = styled.input.attrs({ type: "checkbox" })`
  margin-top: 0.25rem;
`;

export const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

export const PlaylistRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
`;

export const DescriptionText = styled.p`
  font-size: 0.8125rem;
  color: #888;
  margin-bottom: 1rem;
`;

export const SubmittedLabel = styled.span`
  font-size: 0.6875rem;
  color: #6c6;
`;

export const ComboCountText = styled.p`
  font-size: 0.8125rem;
  color: #888;
  text-align: center;
`;

export const HintText = styled.p`
  font-size: 0.8125rem;
  color: #c9a84c;
  margin-bottom: 0.75rem;
`;
