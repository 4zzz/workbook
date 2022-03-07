import React, { useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { useReposCreateOrUpdateFileContentsMutation } from "../../services/githubApi/endpoints/repos";
import { githubApiErrorMessage } from "../../services/githubApi/errorMessage";

export interface CreateFileButtonProps {
  children?: React.ReactNode,
  owner: string,
  repo: string,
  branch?: string,
  path: string,
  dialogTitle: string,
  confirmText: string,
  closeText: string,
  errEmptyText: string,
  errExistsText?: string,
  existingFilenames?: Set<string>,
  transformFilename?: (filename: string) => string,
  commitMessage: string,
  withContent?: string,
  onFileCreated?: (filename: string) => void,
}

function CreateFileButton(props: CreateFileButtonProps) {
  const { owner, repo, branch, path, existingFilenames, children } = props;
  const { transformFilename, commitMessage, withContent } = props;
  const { dialogTitle, confirmText, closeText, errEmptyText, errExistsText } = props;
  const { onFileCreated } = props;

  const [show, setShow] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');
  const [pendingCreate, setPendingCreate] = useState(false);
  const [filename, setFilename] = useState('');

  const [createFile, createFileResult] = useReposCreateOrUpdateFileContentsMutation();

  const emptyName = transformFilename ? transformFilename('') : '';

  const handleConfirm = () => {
    if (!validate(filename)) {
      return;
    }
    setPendingCreate(true);

    const filepath = path === '' ? filename : `${path}/${filename}`;
    createFile({
      owner, repo, path: filepath,
      body: {
        message: commitMessage,
        content: btoa(withContent || ''),
        branch
      }
    });
  }
  const handleCancel = () => setShow(false);
  const handleShow = () => {
    setFilename(emptyName);
    setShow(true);
    setPendingCreate(false);
    setValidationMsg('')
  }

  const validate = (name: string) => {
    if (name === emptyName) {
      setValidationMsg(errEmptyText);
    } else if (existingFilenames?.has(name)) {
      setValidationMsg(errExistsText || 'filename exists');
    } else {
      setValidationMsg('');
      return true;
    }
    return false
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = transformFilename ? transformFilename(e.target.value) : e.target.value
    setFilename(name);
    validate(name);
  }

  if (createFileResult.isSuccess && pendingCreate) {
    setPendingCreate(false);
    setShow(false);
    onFileCreated && onFileCreated(filename);
  }

  if (createFileResult.error) {
    console.log(createFileResult.error)
  }

  return (
    <>
      <Button variant="success" onClick={handleShow}>{children}</Button>
      <Modal show={show} onHide={handleCancel}>
        <Modal.Header closeButton>
          <Modal.Title>{dialogTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder={dialogTitle.toLowerCase()}
                isInvalid={validationMsg !== ''}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                {validationMsg}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
          {createFileResult.isLoading && <div className="text-center mt-3"><Spinner animation="border" role="status" /></div>}
          {createFileResult.error && <Alert className="mt-3" variant="danger">Chyba ({githubApiErrorMessage(createFileResult.error)})</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>{closeText}</Button>
          <Button variant="primary" onClick={handleConfirm}>{confirmText}</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CreateFileButton;