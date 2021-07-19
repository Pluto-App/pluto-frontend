import React from 'react';
import PropTypes from 'prop-types';
import { StyledUserAvatar, StyledUserAvatarWrapper } from './styles';
export const UserAvatar = (props) => {
  const {
    user: { avatar, name },
  } = props;
  return (
    <StyledUserAvatarWrapper>
      <StyledUserAvatar src={avatar} alt="" />

      <div>{name}</div>
    </StyledUserAvatarWrapper>
  );
};

UserAvatar.propTypes = {
  user: PropTypes.object.isRequired,
};
