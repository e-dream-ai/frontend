import styled from "styled-components";

export const StyledInput = styled.input`
  width: 100%;
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  width: fill-available;
  height: 2.2rem;
  padding: 6px 12px;
  background: #333;
  border-radius: 0;
  border: 0;
  color: #ccc;
`;

export const InputGroup = styled.div`
  display: inline-flex;
  margin-bottom: 15px;
  border-collapse: separate;
`;

export const InputBefore = styled.span`
  height: 2.2rem;
  min-width: 40px;
  padding: 6px 12px;
  background: #252525;
  color: #555;
  text-align: center;
`;

export const InputAfter = styled.span`
  height: 2.2rem;
  min-width: 40px;
  padding: 6px 12px;
  background: #252525;
  color: #555;
  text-align: center;
`;

export default StyledInput;
