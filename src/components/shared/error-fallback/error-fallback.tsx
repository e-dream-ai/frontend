import styled from "styled-components";

// Error Fallback Component
const StyledErrorFallback = styled.div`
  padding: 2rem;
`;

export const ErrorFallback = ({ error }: { error?: Error }) => (
  <StyledErrorFallback>
    <h2>Something went wrong.</h2>
    <details style={{ whiteSpace: "pre-wrap" }}>
      {error && error.toString()}
      <br />
    </details>
  </StyledErrorFallback>
);
