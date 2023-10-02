import ConfirmForgotPassword from "components/pages/confirm-forgot-password/confirm-forgot-password.page";
import ErrorPage from "components/pages/error/error.page";
import ViewDreamPage from "components/pages/view-dream/view-dream.page";
import Container from "components/shared/container/container";
import { ROUTES } from "constants/routes.constants";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./protected-route";

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    errorElement: <ErrorPage />,
    element: (
      <Container>
        <div>Home</div>
      </Container>
    ),
  },
  {
    path: ROUTES.CONFIRM_FORGOT_PASSWORD,
    element: <ConfirmForgotPassword />,
  },
  {
    path: ROUTES.VIEW_DREAM,
    element: (
      <ProtectedRoute>
        <ViewDreamPage />
      </ProtectedRoute>
    ),
  },
]);
