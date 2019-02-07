import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Container from '../styleguides/Container';
import Flex from '../styleguides/Flex';
import determineColorForString from '../utils/determineColorForString';
import { TitleContext } from '../context/AppTitleContext';
import useApi from '../hooks/useApi';
import Busy from './Busy';

const StyledImageLink = styled(({ ...props }) => <Link {...props} />)`
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-decoration: none;
  width: 100%;
`;

const StyledImage = styled.div`
  padding: 4rem;
  background-color: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 200px;
  width: 100%;
`;

const StyledName = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color:  ${props => props.color};
  text-transform: uppercase;
`;

const ImagesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ImageItem = styled(Flex)`
  @media all and (max-width: 900px) {
    flex-basis: 50%;
  }

  @media all and (max-width: 600px) {
    flex-basis: 100%;
  }
`;
const Versions = styled.div`
  display: flex;

  `;

const VersionLabel = styled.span`
  margin: 5px;
  background-color: ${props => props.color};
  border-radius: 10px;
  padding: 0.3rem 0.7rem;
  color: #fff;
  flex-basis: 20%;
`;

const ContainerStatus = styled.span``;

const ContainerStatusAmount = styled.span`
  margin-left: 0.5rem;
  font-weight: bold;
`;

export default function Images() {
  const { dispatch } = useContext(TitleContext);

  useEffect(() => {
    dispatch({
      type: 'default-title'
    });
  }, []);

  const [busy, images] = useApi({
    endpoint: 'images',
    fetchOnMount: true,
    initialData: []
  });

  

  return (
    <Busy busy={busy}>
      <Container gutterTop>
        <ImagesGrid>
          <ImageItem
            child
            basis="33%"
            gutterBottom
            alignItems="center"
            justify="center"
            fullWidth
          >
            <StyledName color={determineColorForString("Create")}>+ CREATE NEW</StyledName>
          </ImageItem>
          {images.map(c => {
            return (
              <ImageItem
                child
                basis="33%"
                gutterBottom
                key={c.image}
                alignItems="center"
                justify="center"
              >
                <StyledImageLink to={`/${c.image}`}>
                  <StyledImage>
                    <StyledName color={determineColorForString(c.image)}>{c.image} ({c.containers.length})</StyledName>
                    <Versions>
                    {Object.keys(c.status).map(status => (
                       <VersionLabel key={status} color={determineColorForString(status + "STATUS")}>
                       <ContainerStatus>{`${status}:`}</ContainerStatus><ContainerStatusAmount>{c.status[status]}</ContainerStatusAmount>
                      </VersionLabel>
                    ))}
                    </Versions>
                  </StyledImage>
                </StyledImageLink>
              </ImageItem>
            );
          })}
        </ImagesGrid>
      </Container>
    </Busy>
  );
}