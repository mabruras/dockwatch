import React, { useContext, useEffect } from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import Container from "../styleguides/Container";
import Flex from "../styleguides/Flex";
import determineColorForString from "../utils/determineColorForString";
import { TitleContext } from "../context/AppTitleContext";
import useApi from "../hooks/useApi";
import Busy from "./Busy";
import { loading } from "../icons";
import { spin } from "../utils/animations";
import DockStatusLabels from "./DockStatusLabels";

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
  color: ${props => props.color};
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

  background-color: #222;
`;

const NameExtras = styled.div`
  margin: 0.5rem 0;
`;

const ImageExtraName = styled.p`
  color: #777;
  font-weight: bold;
  margin: 0;
`;

const Spinner = styled.span`
  margin-right: 0.5rem;
  ${props =>
    props.isLoading &&
    css`
      svg {
        animation: ${spin} 4s infinite linear;
      }
    `}
`;
const RefreshNode = styled.button`
  align-items: center;
  border: 0;
  background-color: #62469438;
  cursor: pointer;
  color: #fff;
  display: flex;
  font-size: 0.8rem;
  font-weight: bold;
  padding: 0.5rem 2rem;
  text-transform: uppercase;
  transition: all 0.1s ease-in-out;
  outline: 0;
  width: 100%;
  justify-content: center;
  &:hover {
    background-color: #62469455;
  }
`;

const RefreshNodeWrapper = styled.div`
  display: flex;
  margin: 0.5rem;
  justify-content: center;
`;

export default function Images() {
  const { dispatch } = useContext(TitleContext);

  useEffect(() => {
    dispatch({
      type: "default-title"
    });
  }, []);

  // eslint-disable-next-line
  const [busy, imageResponse, error, fetchData] = useApi({
    endpoint: "images",
    fetchOnMount: true,
    initialData: []
  });

  return (
    <Container gutterTop>
      <RefreshNodeWrapper>
        <RefreshNode onClick={() => fetchData()}>
          <Spinner isLoading={busy}>{loading}</Spinner> Refresh
        </RefreshNode>
      </RefreshNodeWrapper>

      <Busy busy={busy}>
          {
           <ImagesGrid>
                { imageResponse.data && (
                  <React.Fragment>
                    {
                       imageResponse.data.map(image => {
                        return (
                          <ImageItem
                            child
                            basis="32%"
                            gutterBottom
                            key={image.name}
                            alignItems="center"
                            justify="center"
                          >
                            <StyledImageLink to={`/${image.name}`}>
                              <StyledImage>
                                <NameExtras>
                                  {image.extra.map(e => (
                                    <ImageExtraName>{`${e}`.toUpperCase()}</ImageExtraName>
                                  ))}
                                </NameExtras>
                                <StyledName color={determineColorForString(image.name)}>
                                  {image.name} ({image.containers.length})
                                </StyledName>
            
                                <DockStatusLabels statuses={image.status} />
                              </StyledImage>
                            </StyledImageLink>
                          </ImageItem>
                        );
                      })
                    }
                  </React.Fragment>

                )
                 
                }
        </ImagesGrid>
            })
          }
      </Busy>
    </Container>
  );
}
