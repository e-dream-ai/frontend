import ConfirmForgotPassword from "components/pages/confirm-forgot-password/confirm-forgot-password.page";
import ErrorPage from "components/pages/error/error.page";
import FeedPage from "components/pages/feed/feed.page";
import MyDreamsPage from "components/pages/my-dreams/my-dreams.page";
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
    path: `${ROUTES.VIEW_DREAM}/:uuid`,
    element: (
      <ProtectedRoute>
        <ViewDreamPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.MY_DREAMS,
    element: (
      <ProtectedRoute>
        <MyDreamsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.FEED,
    element: (
      <ProtectedRoute>
        <FeedPage />
      </ProtectedRoute>
    ),
  },
]);

export default router;
