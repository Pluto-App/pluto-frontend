import React from 'react';
import styled from 'styled-components';

import { useOvermind } from '../../overmind';
import SettingAreaChart from '../common/SettingAreaChart';
import SettingPie from '../common/SettingPie';
import { Doughnut } from 'react-chartjs-2';

const StyledCardWrapper = styled.div`
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin: 20px;
  color: black;
`;
const StyledCardContent = styled.div`
  display: flex;
  height: 95%;
`;

const StyledSettingContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTitleWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const StyledWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const StyledSettingAreaChart = styled.div`
  width: 33%;
  max-width: 500px;
`;
const StyledSettingFullWidthChart = styled.div`
  width: 99%;
  max-width: 1500px;
  height: 50vh;
`;
const StyledSectionWrapper = styled.section`
  width: 100%;
  flex-direction: row;
  display: flex;
`;
const StyledUserSection = styled.section`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const StyledUserContainer = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
  height: 100%;
  padding: 10px;
`;
const StyledProfileSection = styled.section`
  display: flex;
  width: 100%;
  flex-direction: column;
`;
const StyledNumberSection = styled.div`
  display: flex;
  flex-direction: column;
`;
const StyledUserAvatar = styled.img`
  width: 100px;
  border-radius: 50%;
`;
const StyledNumber = styled.div`
  font-size: 2em;
`;
const StyledSecondaryText = styled.div`
  color: gray;
  font-weight: light;
`;
const StyledGhostButton = styled.button`
  display: flex;
  flex-direction: column;
  padding: 10px;
  color: #007cff;
  border: 2px solid #007cff;
  border-radius: 12px;
`;
const StyledUserName = styled.h2`
  font-size: 1.5em;
  font-weight: 300;
  margin: 2px 0;
`;
const options = {
  cutout: 80,
  tension: 0.5,
  elements: {
    arc: {
      borderWidth: 3,
    },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
};

const data = {
  datasets: [
    {
      label: '# of Votes',
      data: [70, 30],
      fill: true,
      backgroundColor: ['#FF3A29', '#FFE5D3'],
      borderColor: ['#FF3A29', '#FFE5D3'],
      borderWidth: 1,
    },
  ],
};
const GhostButton = ({ children, onClick }) => {
  return <StyledGhostButton onClick={onClick}>{children}</StyledGhostButton>;
};
const UserProfile = () => {
  const { state, actions } = useOvermind();
  return (
    <StyledUserContainer>
      <StyledUserSection>
        <StyledProfileSection>
          <StyledUserAvatar src={state.userProfileData.avatar} alt="" />
          <StyledUserName>{state.userProfileData.name}</StyledUserName>
          <StyledSecondaryText>Graphic Designer</StyledSecondaryText>
        </StyledProfileSection>
      </StyledUserSection>
      <StyledUserSection>
        <StyledNumberSection>
          <StyledNumber>100 345</StyledNumber>
          <StyledSecondaryText>Hours worked</StyledSecondaryText>
        </StyledNumberSection>
        <StyledNumberSection>
          <StyledNumber>3</StyledNumber>
          <StyledSecondaryText>Weekly standing</StyledSecondaryText>
        </StyledNumberSection>
      </StyledUserSection>
      <StyledUserSection>
        <GhostButton> Add to list</GhostButton>
        <i
          className="material-icons focus:outline-none md-light"
          style={{ fontSize: '30px', color: '#007cff' }}
        >
          notifications
        </i>
      </StyledUserSection>
    </StyledUserContainer>
  );
};
const Card = ({ children, title }) => {
  return (
    <StyledCardWrapper style={{ height: '90%', minWidth: '250px' }}>
      <StyledTitleWrapper>
        <StyledUserName>{title}</StyledUserName>
        <i
          className="material-icons focus:outline-none md-light"
          style={{ fontSize: '30px' }}
        >
          more_horiz
        </i>
      </StyledTitleWrapper>
      <StyledCardContent>{children}</StyledCardContent>
    </StyledCardWrapper>
  );
};
export default function SettingsGraph() {
  return (
    <StyledSettingContainer>
      <StyledWrapper>
        <StyledSectionWrapper>
          <StyledSettingAreaChart>
            <Card title="Hours logged">
              <Doughnut data={data} options={options} />
            </Card>
          </StyledSettingAreaChart>

          <StyledSettingAreaChart>
            <Card title="Productivity">
              <SettingPie></SettingPie>
            </Card>
          </StyledSettingAreaChart>
          <StyledSettingAreaChart>
            <Card>
              <UserProfile></UserProfile>
            </Card>
          </StyledSettingAreaChart>
        </StyledSectionWrapper>
        <StyledSettingFullWidthChart>
          <Card title="App Usage">
            <SettingAreaChart></SettingAreaChart>
          </Card>
        </StyledSettingFullWidthChart>
      </StyledWrapper>
    </StyledSettingContainer>
  );
}
