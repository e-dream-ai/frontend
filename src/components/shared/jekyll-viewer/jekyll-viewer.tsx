import styled from "styled-components";

const StyledIframe = styled.iframe`
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  width: 100%;
  border: none;
`;

const JekyllViewer = () => {
  const path = import.meta.env.DEV ? "/help" : "/";
  const src = `${path}/index.html`;

  return (
    <>
      <StyledIframe
        src={src}
        title="Help Site"
        height="100%"
        sandbox="allow-scripts allow-same-origin"
        allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
      />
    </>
  );
};

export default JekyllViewer;
