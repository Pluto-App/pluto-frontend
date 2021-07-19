import {
  StyledCardWrapper,
  StyledTitleWrapper,
  StyledCardTitle,
  StyledCardContent,
} from './styles.js';

export const Card = ({ children, title, style }) => {
  return (
    <StyledCardWrapper {...style}>
      <StyledTitleWrapper>
        <StyledCardTitle>{title}</StyledCardTitle>
      </StyledTitleWrapper>
      <StyledCardContent>{children}</StyledCardContent>
    </StyledCardWrapper>
  );
};
