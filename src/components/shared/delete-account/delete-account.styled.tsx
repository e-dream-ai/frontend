import styled, { keyframes } from "styled-components";

const reveal = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
`;

export const ConfirmationDialog = styled.dialog`
  width: min(29rem, calc(100% - 2rem));
  max-height: calc(100dvh - 3rem);
  overflow: hidden auto;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colorBackgroundSecondary};
  border-radius: 8px;
  background: ${({ theme }) => theme.colorBackgroundQuaternary};
  color: ${({ theme }) => theme.textBodyColor};
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);

  &[open] {
    animation: ${reveal} 160ms ease-out;
  }

  &::backdrop {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(2px);
  }

  @media (prefers-reduced-motion: reduce) {
    &[open] {
      animation: none;
    }
  }
`;

export const DialogBody = styled.div`
  padding: 1.75rem 1.75rem 1.5rem;
`;

/**
 * The house display face (Comfortaa, lowercased) is deliberately withheld here.
 * This is the one dialog in the app that should not sound friendly.
 */
export const DialogTitle = styled.h2`
  && {
    margin: 0 0 0.625rem;
    font-family: inherit;
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.2;
    text-transform: none;
    color: ${({ theme }) => theme.textPrimaryColor};
  }
`;

/** Names the thing being deleted, so it is never an abstract action. */
export const AccountIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin: 1.25rem 0 0;
  padding: 0.875rem 1rem;
  border: 1px solid ${({ theme }) => theme.colorBackgroundSecondary};
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.35);
`;

export const IdentityText = styled.div`
  min-width: 0;

  strong {
    display: block;
    font-size: 0.95rem;
    font-weight: 700;
    color: ${({ theme }) => theme.textPrimaryColor};
  }

  span {
    display: block;
    margin-top: 0.125rem;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.textSecondaryColor};
    overflow-wrap: anywhere;
  }
`;

export const ErrorMessage = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colorDanger};
`;

/**
 * Cancel and delete sit at opposite ends: consequential options should never be
 * adjacent to benign ones (NN/G), and the two carry different shapes as well as
 * different colours.
 */
export const DialogFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem 1.75rem;
  border-top: 1px solid ${({ theme }) => theme.colorBackgroundSecondary};
  background: rgba(0, 0, 0, 0.35);

  button {
    min-height: 44px;
  }

  button:focus-visible {
    outline: 2px solid ${({ theme }) => theme.textAccentColor};
    outline-offset: 3px;
  }
`;
