import styled from 'styled-components';

export const StyledCardWrapper = styled.div`
  background: ${(props) => (props.background ? props.background : 'white')};
  width: ${(props) => (props.width ? props.width : 'fit-content')};
  min-width: ${(props) => (props.minWidth ? props.minWidth : '181px')};
  border-radius: 6px;
  margin: 20px 10px;
  color: black;
  padding: 10px;
  height: ${(props) => (props.height ? props.height : 'fit-content')}; ;
`;
export const StyledTitleWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
`;
export const StyledCardContent = styled.div`
  display: flex;
  height: 95%;
  justify-content: center;
  align-items: center;
`;
export const StyledCardTitle = styled.h2`
  font-size: 1.5em;
  font-weight: 300;
  margin: 2px 0;
  padding-left: 10px;
  padding-bottom: 5px;
  color: white;
`;
