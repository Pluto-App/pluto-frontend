import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
const { ipcRenderer, remote } = window.require('electron');

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5em;
  align-items: center;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5em;
  color: #fff;
  background: rgb(47, 49, 54);
  height: 100%;
`;
const StyledHeaderSection = styled.section`
  display: flex;
  flex-direction: column;
  text-align: center;
`;
const StyledHeaderTitle = styled.h1`
  margin: 0;
  padding: 0;
  font-size: 1.8em;
  font-weight: lighter;
  margin-top: 1em;
  margin-bottom: 0em;
`;
const StyledSubTitle = styled.h3`
  margin: 0;
  font-size: 0.8em;
  font-weight: 300;
  margin-bottom: 5.5em;
`;
const StyledLink = styled.a`
  cursor: pointer;
  text-decoration: underline;
`;
const StyledSpan = styled.div`
  margin: 0;
`;
const StyledButton = styled.button`
  background: ${({ hasAccess, theme }) =>
    hasAccess ? theme.colors.sharedWindowPrimary : '#768AD4'};
  color: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  width: 120px;
  padding: 0.4em;
  align-items: center;
  justify-content: center;
`;
const StyledRowLabel = styled.div`
  font-size: 1.2em;
  font-weight: 300;
  line-height: 1.5em;
  /* color: ${({ disabled }) => (disabled ? '#9b9b9b' : '#fff')}; */
  color: ${({ disabled }) => (disabled ? '#9b9b9b' : '#fff')};
  /* color: #9b9b9b; */
  display: flex;
`;
const StyledIcon = styled.i`
  font-size: 24px;
  min-width: 30px;
  padding-left: 2px;
  padding-top: 2px;
  width: 30px;
  margin-right: 0px;
`;
export default function PermissionRequestWindow() {
  const [mediaAccessStatus, setMediaAccessStatus] = useState({});
  const handlePermissionRequest = async (requestType) => {
    const updatedPermission = await ipcRenderer.invoke(
      'ask-media-access',
      requestType
    );
    setMediaAccessStatus({
      ...mediaAccessStatus,
      ...updatedPermission,
    });
  };
  useEffect(() => {
    const permissionStatues = Object.values(mediaAccessStatus);
    const hasAllPermissions =
      permissionStatues.length &&
      permissionStatues.every((permissionStatus) => permissionStatus === true);
    if (hasAllPermissions) {
      const permissionWindow = remote.getCurrentWindow();
      permissionWindow.close();
    }
  }, [mediaAccessStatus]);
  useEffect(() => {
    ipcRenderer.on('permission-data', function (event, data) {
      setMediaAccessStatus(data);
    });
    ipcRenderer.send('ask-media-status');
  }, []);
  if (Object.keys(mediaAccessStatus).length === 0)
    return <StyledContainer></StyledContainer>;
  return (
    <StyledContainer>
      <StyledHeaderSection>
        <StyledHeaderTitle>Let's get you Started!</StyledHeaderTitle>
        <StyledSubTitle>
          <StyledLink href="http://">
            Learn why Pluto need these permissions
          </StyledLink>
          <br></br>
          You are in full control of what is shared.
        </StyledSubTitle>
      </StyledHeaderSection>
      <StyledRow>
        <StyledRowLabel disabled={!mediaAccessStatus.hasMicAccess}>
          <StyledIcon className="material-icons md-light">mic_on</StyledIcon>
          Microphone{' '}
        </StyledRowLabel>

        {
          <StyledButton
            onClick={() => handlePermissionRequest('microphone')}
            hasAccess={mediaAccessStatus.hasMicAccess}
            disabled={mediaAccessStatus.hasMicAccess}
          >
            {mediaAccessStatus.hasMicAccess ? (
              <StyledSpan>&#10003;Allowed</StyledSpan>
            ) : (
              'Allow'
            )}
          </StyledButton>
        }
      </StyledRow>
      <StyledRow>
        <StyledRowLabel disabled={!mediaAccessStatus.hasCameraAccess}>
          <StyledIcon className="material-icons md-light">videocam</StyledIcon>
          Camera{' '}
        </StyledRowLabel>
        {
          <StyledButton
            onClick={() => handlePermissionRequest('camera')}
            hasAccess={mediaAccessStatus.hasCameraAccess}
            disabled={mediaAccessStatus.hasCameraAccess}
          >
            {mediaAccessStatus.hasCameraAccess ? (
              <StyledSpan>&#10003;Allowed</StyledSpan>
            ) : (
              'Allow'
            )}
          </StyledButton>
        }
      </StyledRow>
      <StyledRow>
        <StyledRowLabel disabled={!mediaAccessStatus.hasScreenAccess}>
          <StyledIcon className="material-icons md-light">
            screen_share
          </StyledIcon>
          Screen Sharing{' '}
        </StyledRowLabel>
        {
          <StyledButton
            onClick={() => handlePermissionRequest('screen')}
            hasAccess={mediaAccessStatus.hasScreenAccess}
            disabled={mediaAccessStatus.hasScreenAccess}
          >
            {mediaAccessStatus.hasScreenAccess ? (
              <StyledSpan>&#10003; Allowed</StyledSpan>
            ) : (
              'Allow'
            )}
          </StyledButton>
        }
      </StyledRow>
    </StyledContainer>
  );
}
