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
  font-size: 1rem;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-flow: column;
  margin-bottom: 1rem;
  border-collapse: separate;
`;

export const InputRow = styled.div`
  display: inline-flex;
  border-collapse: separate;
  align-items: center;
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

export const InputError = styled.span`
  font-size: 0.875rem;
  color: #009ba2;
`;

export default StyledInput;
