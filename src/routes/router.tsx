import { Header } from "@/components/shared/header/header";
import AboutPage from "@/components/pages/about/about.page";
import ConfirmForgotPassword from "@/components/pages/confirm-forgot-password/confirm-forgot-password.page";
import ErrorPage from "@/components/pages/error/error.page";
import FeedPage from "@/components/pages/feed/feed.page";
import HelpPage from "@/components/pages/help/help.page";
import InstallPage from "@/components/pages/install/install.page";
import LearnMorePage from "@/components/pages/learn-more/learn-more.page";
import MyDreamsPage from "@/components/pages/my-dreams/my-dreams.page";
import ProfilePage from "@/components/pages/profile/profile.page";
import TermsOfServicePage from "@/components/pages/terms-of-service/terms-of-service.page";
import ViewDreamPage from "@/components/pages/view-dream/view-dream.page";
import { ViewPlaylistPage } from "@/components/pages/view-playlist/view-playlist.page";
import { ROLES } from "@/constants/role.constants";
import { ROUTES } from "@/constants/routes.constants";
import { Outlet, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./protected-route";
import { CreatePage } from "@/components/pages/create/create.page";
import { Footer } from "@/components/shared";

const RootElement = () => (
  <>
    <Header />
    <section style={{ paddingTop: "140px" }}></section>
    <Outlet />
    <section style={{ paddingTop: "140px" }}></section>
    <Footer />
  </>
);

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <RootElement />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: ROUTES.ROOT,
        element: (
          <ProtectedRoute allowedRoles={[ROLES.USER_GROUP, ROLES.ADMIN_GROUP]}>
            <ProfilePage isMyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CONFIRM_FORGOT_PASSWORD,
        element: <ConfirmForgotPassword />,
      },
      {
        path: `${ROUTES.CREATE}`,
        element: (
          <ProtectedRoute allowedRoles={[ROLES.USER_GROUP, ROLES.ADMIN_GROUP]}>
            <CreatePage />
          </ProtectedRoute>
        ),
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
            <ProfilePage isMyProfile />
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
      {
        path: ROUTES.HELP,
        element: (
          <ProtectedRoute allowedRoles={[ROLES.USER_GROUP, ROLES.ADMIN_GROUP]}>
            <HelpPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.LEARN_MORE,
        element: (
          <ProtectedRoute allowedRoles={[ROLES.USER_GROUP, ROLES.ADMIN_GROUP]}>
            <LearnMorePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ABOUT,
        element: <AboutPage />,
      },
      {
        path: ROUTES.INSTALL,
        element: <InstallPage />,
      },
      {
        path: ROUTES.TERMS_OF_SERVICE,
        element: <TermsOfServicePage />,
      },
    ],
  },
]);

export default router;
