import React from 'react';
import PropTypes from 'prop-types';

import { Card } from '../Card';
import {
  StyledIcon,
  StyledLabel,
  StyledValue,
  StyledTextWrapper,
} from './styles';

export const SingleStatCard = ({ value, icon, label }) => {
  return (
    <Card
      style={{
        background: '#ebebeb',
      }}
    >
      <StyledIcon>
        <i className="material-icons focus:outline-none md-light">{icon}</i>
      </StyledIcon>
      <StyledTextWrapper>
        <StyledLabel>{label}</StyledLabel>
        <StyledValue>{value}</StyledValue>
      </StyledTextWrapper>
    </Card>
  );
};

SingleStatCard.propTypes = {
  value: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};
