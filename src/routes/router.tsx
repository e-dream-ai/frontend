import VerifyEmailPage from "components/pages/verify-email/verify-email.page";
import Container from "components/shared/container/container";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Container>
        <div>Home</div>
      </Container>
    ),
  },
  {
    path: "/verify-email/",
    element: <VerifyEmailPage />,
  },
]);
