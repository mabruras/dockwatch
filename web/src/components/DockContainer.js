import React, {useState} from "react";
import styled from "styled-components";
import DockStatusLabels from "./DockStatusLabels";
import {loading} from "../icons";
import useApi from "../hooks/useApi";
import {spin} from "../utils/animations";
import {isWebUri} from "valid-url";
import {Link} from "react-router-dom";
import determineColorForString from "../utils/determineColorForString";
import {toast} from "react-toastify";

const InstanceTitle = styled.h2`
  color: #fff;
  margin: 0;
`;

const DockLink = styled(({...props}) => <Link {...props} />)`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  cursor: pointer;
`;

const Spinner = styled.span`
  svg {
    animation: ${spin} 4s infinite linear;
  }
`;

const StyledMessage = styled.p`
  margin: 0.5rem 0;
  color: #fff;
`;

const ContainerOptions = styled.div`
  display: flex;
  @media all and (max-width: 450px) {
    justify-content: space-around;
  }
`;

const RemoveWarn = styled.div`
  width: 100%;
  display: flex;
  padding: 1rem;
  background: #222;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const StyledWarnHeader = styled.h3`
  color: salmon;
  margin: 0;
`;

const StyledWarnText = styled.p`
  color: salmon;
  margin: 1rem;
`;

const COMMON_ACTION_BUTTON_STYLES = `
  text-decoration: none;
  outline: 0;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  margin: 0 0.5rem;
  transition: all 0.15s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  @media all and (max-width: 450px) {
    margin: 0.5rem;
  }
`;

const StyledActionButton = styled.button`
  ${COMMON_ACTION_BUTTON_STYLES}
`;

const SiteLink = styled.a`
  color: lightskyblue;
  ${COMMON_ACTION_BUTTON_STYLES}
`;

const Cancel = styled(StyledActionButton)`
  color: #dbdbdb;
`;

const Remove = styled(StyledActionButton)`
  color: salmon;
`;

const Restart = styled(StyledActionButton)`
  color: orange;
}
`;

const Instance = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 3px solid ${props => props.color || "transparent"};

  @media all and (max-width: 650px) {
    display: block;
  }
`;

const Info = styled("div")`
display: flex;
`;

export default function DockContainer({container, imageId, onlyActions, handleRefetch}) {
  const [isRemoving, setIsRemoving] = useState(false);

  // eslint-disable-next-line
  const [restartingContainer, restartResponse, err1, restartContainer] = useApi(
    {
      endpoint: `images/${imageId}/containers/${container.name}/restart`,
      method: "POST",
      successDelay: 2000,
      onSuccess: () => {
        toast.success(`Successfully restarted ${container.name}. 🦄`);
        handleRefetch();
      },
      onError: e => {
        toast.error(`Ouch! Failed to restart ${container.name}. 🤔`)
      }
    }
  );

  // eslint-disable-next-line
  const [removingContainer, removeResponse, err2, removeContainer] = useApi({
    endpoint: `images/${imageId}/containers/${container.name}/delete`,
    method: "DELETE",
    successDelay: 2000,
    onSuccess: () => {
      setIsRemoving(false);
      handleRefetch();
      toast.success(`Successfully removed ${container.name}. 😊`)
    },
    onError: (error) => {
      toast.error(`Ouch! Failed to delete ${container.name}. 💔`)
    }
  });

  let containerHref =
    container.instances.find(
      instance => instance.labels && instance.labels["dockwatch.url"]
    ) || "#";

  let isRemovable = container.instances.filter(
    instance =>
      instance.labels &&
      instance.labels["dockwatch.removable"] &&
      instance.labels["dockwatch.removable"].toUpperCase() === "TRUE"
  );
  let isRestartable = container.instances.filter(
    instance =>
      instance.labels &&
      instance.labels["dockwatch.restartable"] &&
      instance.labels["dockwatch.restartable"].toUpperCase() === "TRUE"
  );

  if (containerHref !== "#" && !isWebUri(containerHref)) {
    containerHref = "http://" + containerHref;
  }

  return (
    <React.Fragment>
      <Instance color={determineColorForString(container.name)}>
        {!onlyActions && (
          <DockLink to={`/${imageId}/${container.name}`}>
            <InstanceTitle color={determineColorForString(container.name)}>
              {(removingContainer || restartingContainer) && <Spinner>{loading}</Spinner>} {container.name}
            </InstanceTitle>
          </DockLink>
        )}
        <Info>
          {!onlyActions && (
            <DockStatusLabels statuses={container.status}/>
          )}
          {!isRemoving && (
            <ContainerOptions>
              {(isRestartable.length > 0) && (
                <Restart onClick={() => {
                  if (isRestartable.length === container.instances.length
                    || window.confirm(`This will only restart ${isRestartable.length}/${container.instances.length} instances.`)) {
                    restartContainer()
                  }
                }}>RESTART</Restart>
              )}
              {(isRemovable.length > 0) && (
                <Remove onClick={() => setIsRemoving(true)}>REMOVE</Remove>
              )}
              {containerHref !== "#" && (
                <SiteLink href={containerHref}>VIEW SITE</SiteLink>
              )}
            </ContainerOptions>

          )}
        </Info>
      </Instance>

      {removingContainer && <StyledMessage>Removing container..</StyledMessage>}
      {isRemoving && (
        <RemoveWarn>
          <StyledWarnHeader>Confirm remove</StyledWarnHeader>
          <StyledWarnText>
            Warning: This action cannot be undone.
            This will remove {`${isRemovable.length}/${container.instances.length}`} instances.
          </StyledWarnText>
          <ContainerOptions>
            <Cancel onClick={() => setIsRemoving(false)}>CANCEL</Cancel>
            <Remove onClick={() => removeContainer()}>REMOVE</Remove>
          </ContainerOptions>
        </RemoveWarn>
      )}

    </React.Fragment>
  );
}
