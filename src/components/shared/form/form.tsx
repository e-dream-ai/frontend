import { DEVICES } from "@/constants/devices.constants";
import styled from "styled-components";

/**
 * To have a proper form layout, use it together as follows
 * @example
 * <FormContainer>
 *   <FormItem>
 *     <Input />
 *   </FormItem>
 *   <FormItem>
 *     <Input />
 *   </FormItem>
 * </FormContainer>
 */

// flex container for form layout
export const FormContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  gap: 1rem;
`;

// form item
export const FormItem = styled.div`
  display: flex;
  flex: 0 1 calc(50% - 0.5rem);
  flex-flow: column;
  margin: 0px;

  @media (max-width: ${DEVICES.MOBILE_L}) {
    flex: 1 1 100%;
  }

  & > div {
    margin-bottom: 0px;
  }
`;
