import styled from "styled-components";
import { DEVICES } from "@/constants/devices.constants";

export const AuthScreen = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 1rem;

  @media (max-width: ${DEVICES.TABLET}) {
    padding-top: 0.5rem;
  }
`;

export const AuthCardBox = styled.div`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-flow: column;
  padding: 2.5rem 2.25rem;
  background: #0d0d0d;
  border: 1px solid rgba(252, 217, 183, 0.1);
  border-radius: 14px;
  box-shadow: 0 24px 70px -30px rgba(0, 0, 0, 0.9);

  > h2 {
    margin-bottom: 0.35rem;
  }

  form {
    width: 100%;
    display: flex;
    flex-flow: column;
  }

  .input-control {
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    overflow: hidden;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .input-control:focus-within {
    border-color: rgba(252, 217, 183, 0.45);
    box-shadow: 0 0 0 3px rgba(252, 217, 183, 0.08);
  }

  .input-control > div,
  .input-control input {
    background: #1a1a1a;
  }

  .input-control > div:first-child {
    color: rgba(252, 217, 183, 0.55);
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.32);
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  a {
    color: ${(props) => props.theme.textAccentColor};
  }

  a:hover {
    color: #ff9d6b;
  }

  .auth-cta {
    width: -webkit-fill-available;
    background: #1f1f1f;
    color: rgba(255, 255, 255, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.07);
  }

  .auth-cta:hover:not(:disabled) {
    filter: none;
    background: #252525;
    color: rgba(255, 255, 255, 0.5);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .auth-cta.is-ready {
    background: ${(props) => props.theme.colorSecondary};
    color: #000;
    border-color: transparent;
  }

  .auth-cta.is-ready:hover:not(:disabled) {
    filter: none;
    background: ${(props) => props.theme.colorSecondary};
    color: #000;
    filter: brightness(1.1);
  }

  .auth-cta:disabled {
    opacity: 1;
    background: #1f1f1f;
    color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.05);
    cursor: not-allowed;
  }

  @media (max-width: ${DEVICES.TABLET}) {
    padding: 2rem 1.5rem;
  }
`;

export const AuthSubtitle = styled.p`
  margin: 0 0 1.75rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: ${(props) => props.theme.textSecondaryColor};
`;

export const AuthFooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem 1.25rem;
  margin-top: 1rem;
  padding-top: 1.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.9rem;
`;
