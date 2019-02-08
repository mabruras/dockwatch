import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import { fadeInBottom } from "../utils/animations";
import useApi from "../hooks/useApi";
import { TitleContext } from "../context/AppTitleContext";
import determineColorForString from "../utils/determineColorForString";
import Flex from "../styleguides/Flex";

const CreateNodeWrapper = styled.div`
 
`;

const InputWrapper = styled.div`
  width: 100%;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledInput = styled.input`
  padding: 0.6rem 0.8rem;
  outline: 0;
  font-size: 2.5rem;
  transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
  border: 0;
  background-color: #111;
  color: #fff;
  outline: none;
  resize: none;
  font-family: "Roboto", sans-serif;
  width: 100%;
  height: 135px;

  &::placeholder { 
    color: #777;
    font-family: "Roboto", sans-serif;
  }

  @media all and (max-width: 600px) {
    font-size: 1rem;
    height: 60px;
  }
`;

const StyledTextArea = styled.textarea`
  padding: 0.6rem 0.8rem;
  outline: 0;
  overflow: hidden;
  font-size: 1.5rem;
  border: 0;
  background-color: #111;
  color: #fff;
  outline: none;
  resize: none;
  font-family: "Roboto", sans-serif;
  width: 100%;
  height: 100px;

  &::placeholder {
    color: #777;
    font-family: "Roboto", sans-serif;
  }

  @media all and (max-width: 600px) {
    font-size: 1rem;
    height: 55px;
  }
`;

const CreateNodeButton = styled.button`
  outline: 0;
  padding: 0.5rem 1rem;
  background-color: #946ddc;
  border: 0;
  border-bottom: 4px solid #624694;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  animation: ${fadeInBottom} 0.25s ease-in-out 0s 1;
`;

const CreateNodeButtonWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 40px;
  import { TitleContext } from '../context/AppTitleContext';
  background-color: #111;
`;

const CreateNodeButtonText = styled.span`
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 0.1rem;
`;

const NodeTag = styled.span`
  padding: 0.5rem;
  font-size: 5rem;
  font-weight: bold;
  margin-right: 10px;
  color: ${props => props.color};
  transition: color 0.5s ease-in-out;

  @media all and (max-width: 600px) {
    font-size: 3rem;
  }
`;

const Error = styled.p`
  color: #d45f85;
  margin: 0;
  padding: 0.5rem 0;
  font-size: 1.5rem;
  animation: ${fadeInBottom} 0.25s eauseEffect-out 0s 1;

  @media all and (max-width: 600px) {useEffect
    font-size: 0.9rem;
  }
`;

const NODE_NAME_MAX_LENGTH = 25;
const NODE_DESCRIPTION_MAX_LENGTH = 100;

export default function CreateNode() {

  const { dispatch } = useContext(TitleContext);
  const [nodeName, setNodeName] = useState("");
  const [nodeDescription, setNodeDescription] = useState("");
  const [createNodeError, setCreateNodeError] = useState(undefined);


  useEffect(() => {
    dispatch({
      type: 'set-title',
      data: {
        title: "Create Node",
        titleColor: determineColorForString("nodes")
      }
    });
  }, []);


  // eslint-disable-next-line
  const [creating, res, err, submitNewNode] = useApi({
    endpoint: `categories/1/nodes`,
    method: "POST",
    body: {
      name: nodeName.trim(),
      description: nodeDescription.trim()
    },
    onSuccess: newNode => {
      resetInput();
    },
    onError: e => {
      setCreateNodeError("Wops! Couldn't create node.");
    }
  });

  function resetInput() {
    setNodeName("");
    setNodeDescription("");
  }

  function handleInputChange(e, stateUpdaterFunc, maxLength) {
    const { value } = e.target;

    if (value.trim().length < maxLength) {
      stateUpdaterFunc(value);
    }
  }

  function renderError(errorMessage) {
    return (
      <Flex alignItems="center" justify="center">
        <Error>{errorMessage}</Error>
      </Flex>
    );
  }


  return (
      <CreateNodeWrapper>
          <>
            <InputWrapper>
              <NodeTag color={determineColorForString(nodeName)}>
                #
              </NodeTag>
              <StyledInput
                disabled={creating}
                placeholder="Node name.."
                value={nodeName}
                onChange={e =>
                  handleInputChange(e, setNodeName, NODE_NAME_MAX_LENGTH)
                }
              />
            </InputWrapper>
            {nodeName.trim().length === NODE_NAME_MAX_LENGTH - 1 &&
              renderError(
                `Node name cannot be longer than ${NODE_NAME_MAX_LENGTH} characters.`
              )}
            <StyledTextArea
              disabled={creating}
              placeholder={`Base URL of ${nodeName.trim() ||
                "the node"}..`}
              value={nodeDescription}
              onChange={e =>
                handleInputChange(
                  e,
                  setNodeDescription,
                  NODE_DESCRIPTION_MAX_LENGTH
                )
              }
            />
            {nodeDescription.trim().length ===
              NODE_DESCRIPTION_MAX_LENGTH - 1 &&
              renderError(
                `Base URL cannot be longer than ${NODE_DESCRIPTION_MAX_LENGTH} characters.`
              )}
            <CreateNodeButtonWrapper>
              {nodeName.length > 0 && nodeName.trim().length > 0 && (
                <CreateNodeButton onClick={submitNewNode}>
                  <CreateNodeButtonText>OPPRETT</CreateNodeButtonText>
                </CreateNodeButton>
              )}
            </CreateNodeButtonWrapper>
            {createNodeError &&
              renderError(
                createNodeError
              )}
          </>
      </CreateNodeWrapper>
  );
}
