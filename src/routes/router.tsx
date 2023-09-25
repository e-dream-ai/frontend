import VerifyEmailPage from "components/pages/verify-email/verify-email.page";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Home</div>,
  },
  {
    path: "/verify-email/",
    element: <VerifyEmailPage />,
  },
]);
