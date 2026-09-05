import styled, { keyframes } from "styled-components";

const reveal = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
`;

export const DeleteAccountTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 0.875rem;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.textSecondaryColor};
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 160ms ease;

  span {
    border-bottom: 1px solid ${({ theme }) => theme.colorBackgroundSecondary};
    transition: border-color 160ms ease;
  }

  &:hover {
    color: ${({ theme }) => theme.colorDanger};
  }

  &:hover span {
    border-bottom-color: currentColor;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.textAccentColor};
    outline-offset: 2px;
    border-radius: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
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

export const Lead = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
`;

export const AccountIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin: 1.25rem 0;
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

export const Consequences = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.9rem;
  line-height: 1.55;

  li {
    position: relative;
    padding: 0 0 0 1rem;
  }

  li + li {
    margin-top: 0.5rem;
  }

  li::before {
    content: "";
    position: absolute;
    top: 0.6em;
    left: 0;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${({ theme }) => theme.textSecondaryColor};
  }

  b {
    font-weight: 700;
    color: ${({ theme }) => theme.textPrimaryColor};
  }
`;

export const ConfirmationLabel = styled.label`
  display: block;
  margin: 1.5rem 0 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textBodyColor};

  code {
    padding: 0.2em 0.4em;
    border-radius: 3px;
    background: ${({ theme }) => theme.colorBackgroundSecondary};
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.85em;
    letter-spacing: 0.12em;
    color: ${({ theme }) => theme.textAccentColor};
  }
`;

export const ConfirmationInput = styled.input`
  width: 100%;
  min-height: 46px;
  padding: 0 0.875rem;
  border: 1px solid ${({ theme }) => theme.colorBackgroundSecondary};
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.35);
  color: ${({ theme }) => theme.textPrimaryColor};
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.95rem;
  letter-spacing: 0.18em;
  transition: border-color 160ms ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.textAccentColor};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.55;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const ErrorMessage = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colorDanger};
`;

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

export const CancelButton = styled.button`
  padding: 0.5rem 0;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.textBodyColor};
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.textPrimaryColor};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
