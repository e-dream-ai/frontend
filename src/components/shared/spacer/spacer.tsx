import { css } from "styled-components";

export type SpacerType = {
  margin?: string;
  mt?: string;
  mr?: string;
  mb?: string;
  ml?: string;
  padding?: string;
  pt?: string;
  pr?: string;
  pb?: string;
  pl?: string;
};

export const spacer = (props: SpacerType) => css`
  margin: ${props.margin};
  margin-top: ${props.mt};
  margin-right: ${props.mr};
  margin-bottom: ${props.mb};
  margin-right: ${props.ml};
  padding: ${props.padding};
  padding-top: ${props.pt};
  padding-right: ${props.pr};
  padding-bottom: ${props.pb};
  padding-left: ${props.pl};
`;
