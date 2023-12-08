import ConfirmForgotPassword from "components/pages/confirm-forgot-password/confirm-forgot-password.page";
import ErrorPage from "components/pages/error/error.page";
import FeedPage from "components/pages/feed/feed.page";
import MyDreamsPage from "components/pages/my-dreams/my-dreams.page";
import ProfilePage from "components/pages/profile/profile.page";
import ViewDreamPage from "components/pages/view-dream/view-dream.page";
import { ViewPlaylistPage } from "components/pages/view-playlist/view-playlist.page";
import Container from "components/shared/container/container";
import { ROLES } from "constants/role.constants";
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
      <ProtectedRoute allowedRoles={[ROLES.USER_GROUP, ROLES.ADMIN_GROUP]}>
        <ViewDreamPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.MY_DREAMS,
    element: (
      <ProtectedRoute allowedRoles={[ROLES.USER_GROUP, ROLES.ADMIN_GROUP]}>
        <MyDreamsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.FEED,
    element: (
      <ProtectedRoute allowedRoles={[ROLES.USER_GROUP, ROLES.ADMIN_GROUP]}>
        <FeedPage />
      </ProtectedRoute>
    ),
  },
  {
    path: `${ROUTES.VIEW_PLAYLIST}/:id`,
    element: (
      <ProtectedRoute allowedRoles={[ROLES.USER_GROUP, ROLES.ADMIN_GROUP]}>
        <ViewPlaylistPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.MY_PROFILE,
    element: (
      <ProtectedRoute allowedRoles={[ROLES.USER_GROUP, ROLES.ADMIN_GROUP]}>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: `${ROUTES.PROFILE}/:id`,
    element: (
      <ProtectedRoute allowedRoles={[ROLES.USER_GROUP, ROLES.ADMIN_GROUP]}>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
]);

export default router;
