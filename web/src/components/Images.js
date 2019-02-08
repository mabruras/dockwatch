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
  margin: 0.5rem 0;
`;

const ImagesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const ImageItem = styled(Flex)`
  margin: 0.5rem;

  @media all and (max-width: 900px) {
    flex-basis: 50%;
  }

  @media all and (max-width: 600px) {
    flex-basis: 100%;
  }

  background-color: ${props => props.color ? props.color : '#222'};
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

const NameExtras = styled.div`
  margin: 0.5rem 0;
  `;

const ImageExtraName = styled.p`
  color: #777;
  font-weight: bold;
  margin: 0;
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
            basis="32%"
            gutterBottom
            alignItems="center"
            justify="center"
            fullWidth
            color={"#62469452"}
          >
          <StyledImageLink to={`/nodes`}>
            <StyledName color={"#fff"}>Change Node</StyledName>
          </StyledImageLink>
          </ImageItem>
          {images.map(c => {
            return (
              <ImageItem
                child
                basis="32%"
                gutterBottom
                key={c.image.name}
                alignItems="center"
                justify="center"
              >
                <StyledImageLink to={`/${c.image.name}`}>
                  <StyledImage>
                      <NameExtras>
                          {c.image.extra.map( e => (
                              <ImageExtraName>{`${e}`.toUpperCase()}</ImageExtraName>
                          ))}
                      </NameExtras>
                    <StyledName color={determineColorForString(c.image.name)}>{c.image.name} ({c.containers.length})</StyledName>

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
