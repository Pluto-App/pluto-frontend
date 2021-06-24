import React from 'react';
import styled from 'styled-components';

import SettingAreaChart from '../common/SettingAreaChart';
import SettingPie from '../common/SettingPie';
import { Doughnut } from 'react-chartjs-2';

const StyledWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const StyledSettingAreaChart = styled.div`
  width: 60%;
`;
const options = {
  tension: 0.5,
  legend: {
    display: false,
  },
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
};

const data = {
  datasets: [
    {
      label: '# of Votes',
      data: [70, 30],
      fill: true,
      backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(10, 10, 10, 0.5)'],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(10, 10, 10, 1)'],
      borderWidth: 1,
    },
  ],
};

export default function SettingsGraph() {
  return (
    <div>
      <StyledWrapper>
        <StyledSettingAreaChart>
          <Doughnut data={data} options={options} />
        </StyledSettingAreaChart>

        <StyledSettingAreaChart>
          <SettingPie></SettingPie>
        </StyledSettingAreaChart>

        <StyledSettingAreaChart>
          <SettingAreaChart></SettingAreaChart>
        </StyledSettingAreaChart>
      </StyledWrapper>
    </div>
  );
}
