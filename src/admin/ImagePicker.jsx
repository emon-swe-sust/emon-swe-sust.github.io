import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert, AlertIcon, Box, Button, Checkbox, Flex, FormControl, FormLabel, Image, Input,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  SimpleGrid, Spinner, Text, useToast,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { listImages, uploadImage } from "./api";

/**
 * Pick existing images from public/ or upload new ones.
 * onPick receives an array of site paths such as "/projects/foo/1.png".
 */
export default function ImagePicker({ isOpen, onClose, onPick, multiple = false, uploadDir = "" }) {
  const [state, setState] = useState({ loading: true, images: [], error: null });
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [folder, setFolder] = useState(uploadDir);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);
  const toast = useToast();

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { images } = await listImages();
      setState({ loading: false, images, error: null });
    } catch (e) {
      setState({ loading: false, images: [], error: e.message });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSelected([]);
    setFilter("");
    setFolder(uploadDir);
    refresh();
  }, [isOpen, uploadDir, refresh]);

  const finish = (paths) => {
    onPick(paths);
    onClose();
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setUploading(true);
    const paths = [];
    try {
      for (const file of files) {
        const res = await uploadImage(file, folder.replace(/^\/+|\/+$/g, ""));
        paths.push(res.path);
      }
      finish(paths);
    } catch (e) {
      toast({ title: "Upload failed", description: e.message, status: "error", duration: 8000, isClosable: true });
      if (paths.length) refresh();
    } finally {
      setUploading(false);
    }
  };

  const toggle = (path) =>
    setSelected((s) => (s.includes(path) ? s.filter((p) => p !== path) : [...s, path]));

  const visible = state.images.filter((img) => img.path.toLowerCase().includes(filter.toLowerCase()));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{multiple ? "Add images" : "Choose an image"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex gap={3} wrap="wrap" align="flex-end" mb={4} p={3} borderWidth="1px" rounded="md" bg="gray.50">
            <FormControl maxW="320px">
              <FormLabel fontSize="xs" mb={1}>Upload into folder (inside public/)</FormLabel>
              <Input size="sm" bg="white" value={folder} placeholder="e.g. projects/my-project" onChange={(e) => setFolder(e.target.value)} />
            </FormControl>
            <input
              ref={fileInput}
              type="file"
              accept="image/*,.heic,.heif"
              multiple={multiple}
              hidden
              data-testid="image-file-input"
              onChange={handleFiles}
            />
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<FontAwesomeIcon icon={faUpload} />}
              isLoading={uploading}
              onClick={() => fileInput.current.click()}
            >
              Upload {multiple ? "files…" : "a file…"}
            </Button>
            <Text fontSize="xs" color="gray.600" flex="1" minW="200px">
              Letters, numbers, “.”, “_” and “-” only (spaces become “-”). Existing files are never overwritten.
            </Text>
          </Flex>

          <Input size="sm" mb={3} placeholder="Filter existing images…" value={filter} onChange={(e) => setFilter(e.target.value)} />

          {state.loading && <Flex justify="center" py={10}><Spinner /></Flex>}
          {state.error && <Alert status="error" rounded="md"><AlertIcon />{state.error}</Alert>}
          {!state.loading && !state.error && visible.length === 0 && (
            <Text color="gray.500" py={6} textAlign="center">No images match.</Text>
          )}

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            {visible.map((img) => {
              const isSelected = selected.includes(img.path);
              return (
                <Box
                  key={img.path}
                  as="button"
                  type="button"
                  textAlign="left"
                  borderWidth="2px"
                  borderColor={isSelected ? "green.400" : "gray.200"}
                  rounded="md"
                  p={2}
                  _hover={{ borderColor: "green.300" }}
                  onClick={() => (multiple ? toggle(img.path) : finish([img.path]))}
                  aria-label={`${multiple ? "Select" : "Use"} ${img.path}`}
                  aria-pressed={multiple ? isSelected : undefined}
                >
                  <Flex h="90px" align="center" justify="center" bg="gray.100" rounded="sm" mb={1}>
                    <Image src={img.path} maxH="90px" maxW="100%" objectFit="contain" loading="lazy" alt="" />
                  </Flex>
                  <Text fontSize="xs" noOfLines={2} wordBreak="break-all">{img.path}</Text>
                  {multiple && <Checkbox isChecked={isSelected} pointerEvents="none" size="sm" readOnly aria-hidden tabIndex={-1} />}
                </Box>
              );
            })}
          </SimpleGrid>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {multiple && (
            <Button colorScheme="green" isDisabled={!selected.length} onClick={() => finish(selected)}>
              Add {selected.length || ""} selected
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
