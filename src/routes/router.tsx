import { Header } from "@/components/shared/header/header";
import AboutPage from "@/components/pages/about/about.page";
import ConfirmForgotPassword from "@/components/pages/confirm-forgot-password/confirm-forgot-password.page";
import FeedPage from "@/components/pages/feed/feed.page";
import HelpPage from "@/components/pages/help/help.page";
import InstallPage from "@/components/pages/install/install.page";
import LearnMorePage from "@/components/pages/learn-more/learn-more.page";
import MyDreamsPage from "@/components/pages/my-dreams/my-dreams.page";
import ProfilePage from "@/components/pages/profile/profile.page";
import InvitesPage from "@/components/pages/invites/invites.page";
import TermsOfServicePage from "@/components/pages/terms-of-service/terms-of-service.page";
import ViewDreamPage from "@/components/pages/view-dream/view-dream.page";
import { ViewPlaylistPage } from "@/components/pages/view-playlist/view-playlist.page";
import { ROLES } from "@/constants/role.constants";
import { ROUTES } from "@/constants/routes.constants";
import {
  Navigate,
  Outlet,
  createBrowserRouter,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./protected-route";
import { CreatePage } from "@/components/pages/create/create.page";
import { Footer } from "@/components/shared";
import { AuthenticatePage } from "@/components/pages/authenticate/authenticate.page";
import { LoginPage } from "@/components/pages/login/login.page";
import { MagicPage } from "@/components/pages/magic/magic.page";
import { SignupPage } from "@/components/pages/signup/signup.page";
import PublicRoute from "@/routes/public-route";
import PlaylistsFeedPage from "@/components/pages/playlist-feed/playlist-feed";
import PlaygroundPage from "@/components/pages/playground/playground.page";
import NotFoundPage from "@/components/pages/not-found/not-found.page";
import { useEffect } from "react";
import ReactGA from "react-ga4";
import { PageContainer } from "@/components/shared/container/page-container";
import RemoteControlPage from "@/components/pages/remote-control/remote-control.page";

export const RootElement = () => {
  const location = useLocation();

  /**
   * Register pageview on location changes
   */
  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: window.location.pathname + window.location.search,
    });
  }, [location]);

  return (
    <PageContainer>
      <Header />
      <Outlet />
      <Footer />
    </PageContainer>
  );
};

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <RootElement />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: ROUTES.ROOT,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <Navigate to={ROUTES.REMOTE_CONTROL} replace />;
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CONFIRM_FORGOT_PASSWORD,
        element: <ConfirmForgotPassword />,
      },
      {
        path: `${ROUTES.PLAYGROUND}/*`,
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN_GROUP]}>
            <PlaygroundPage />
          </ProtectedRoute>
        ),
      },
      {
        path: `${ROUTES.CREATE}/*`,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <CreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: `${ROUTES.VIEW_DREAM}/:uuid`,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <ViewDreamPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.MY_DREAMS,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <MyDreamsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.FEED,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <FeedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PLAYLISTS,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <PlaylistsFeedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: `${ROUTES.VIEW_PLAYLIST}/:uuid`,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <ViewPlaylistPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.MY_PROFILE,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <ProfilePage isMyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.REMOTE_CONTROL,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <RemoteControlPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.INVITES,
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN_GROUP]}>
            <InvitesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: `${ROUTES.PROFILE}/:uuid`,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.HELP,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <HelpPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.LEARN_MORE,
        element: (
          <ProtectedRoute
            allowedRoles={[
              ROLES.USER_GROUP,
              ROLES.CREATOR_GROUP,
              ROLES.ADMIN_GROUP,
            ]}
          >
            <LearnMorePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.AUTHENTICATE,
        element: (
          <PublicRoute>
            <AuthenticatePage />
          </PublicRoute>
        ),
      },
      {
        path: ROUTES.SIGNIN,
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: ROUTES.MAGIC,
        element: (
          <PublicRoute>
            <MagicPage />
          </PublicRoute>
        ),
      },
      {
        path: ROUTES.SIGNUP,
        element: (
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
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
