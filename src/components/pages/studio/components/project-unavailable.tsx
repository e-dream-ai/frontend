import React from "react";
import { ROUTES } from "@/constants/routes.constants";
import { Text, Title } from "./project-dialog.styled";
import { BackLink, Wrapper } from "./project-unavailable.styled";

export const ProjectUnavailable: React.FC = () => (
  <Wrapper as="section" aria-labelledby="project-unavailable-title">
    <Title id="project-unavailable-title">This project isn't available</Title>
    <Text>It was deleted, or you don't have access to it.</Text>
    <BackLink to={ROUTES.STUDIO}>Back to playlists</BackLink>
  </Wrapper>
);
