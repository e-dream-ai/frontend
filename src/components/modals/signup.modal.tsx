import { Anchor, Button, Input, Modal, Row } from "../shared";

export const SignupModal: React.FC<{
  isOpen?: boolean;
  showModal?: () => void;
  hideModal?: () => void;
}> = ({ isOpen = false, showModal, hideModal }) => {
  return (
    <Modal
      title="Sign up for gold"
      isOpen={isOpen}
      showModal={showModal}
      hideModal={hideModal}
    >
      <Input
        placeholder="Email"
        type="email"
        before={<i className="fa fa-envelope" />}
      />
      <Input
        placeholder="Password"
        type="password"
        before={<i className="fa fa-lock" />}
      />
      <Input
        placeholder="Confirm Password"
        type="password"
        before={<i className="fa fa-lock" />}
      />

      <Row justifyContent="flex-end">
        <Button after={<i className="fa fa-angle-right" />}>Next</Button>
      </Row>

      <Anchor>Don&apos;t have an account?</Anchor>
      <Anchor>Forgot your password?</Anchor>
    </Modal>
  );
};
