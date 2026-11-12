import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert, AlertDescription, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader, AlertDialogOverlay, AlertIcon, AlertTitle, Badge, Box, Button, Flex, Heading,
  HStack, Link, Spinner, Stack, Text, Textarea, useToast,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown, faArrowLeft, faArrowUp, faArrowUpRightFromSquare, faCopy, faFloppyDisk, faPen,
  faPlus, faRotateLeft, faTrash,
} from "@fortawesome/free-solid-svg-icons";
import useAdminData, { takeFlash } from "./useAdminData";
import { IconBtn, ObjectForm } from "./fields";
import { SECTIONS, countItems, findProblems, findSection, getIn, moveItem } from "./schema";

// ------------------------------------------------------------------ routing --

/** /admin, /admin/projects, /admin/projects/3  ->  { section, index } */
function useAdminRoute() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [, , sectionId, indexPart] = pathname.split("/");
  const section = findSection(sectionId) || SECTIONS[0];
  const index = indexPart !== undefined && /^\d+$/.test(indexPart) ? Number(indexPart) : null;
  const go = useCallback(
    (id, idx) => navigate(`/admin/${id}${idx === undefined || idx === null ? "" : `/${idx}`}`),
    [navigate]
  );
  return { section, index, go, pathname };
}

// ------------------------------------------------------------------- pieces --

const Card = ({ children, ...props }) => (
  <Box bg="white" borderWidth="1px" rounded="lg" p={{ base: 4, md: 6 }} shadow="sm" {...props}>
    {children}
  </Box>
);

function SectionHeader({ section }) {
  return (
    <Flex justify="space-between" align="flex-start" gap={4} mb={5} wrap="wrap">
      <Box>
        <Heading size="lg">{section.label}</Heading>
        <Text color="gray.600" fontSize="sm" mt={1}>{section.blurb}</Text>
      </Box>
      {section.siteRoute && (
        <Link href={`/#${section.siteRoute}`} isExternal fontSize="sm" color="green.600" whiteSpace="nowrap">
          View on site <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs" />
        </Link>
      )}
    </Flex>
  );
}

function ConfirmDialog({ isOpen, title, children, confirmLabel, onConfirm, onClose }) {
  const cancelRef = useRef();
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">{title}</AlertDialogHeader>
          <AlertDialogBody>{children}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" ml={3} onClick={onConfirm}>{confirmLabel}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

/** A section holding data of an unexpected shape shouldn't blank the whole admin. */
class SectionBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Card>
        <Alert status="error" rounded="md">
          <AlertIcon />
          <Box>
            <AlertTitle>This section's data doesn't have the expected shape.</AlertTitle>
            <AlertDescription>
              Fix it in the Raw JSON tab, or use “Discard changes” at the top to go back to the saved file.
            </AlertDescription>
          </Box>
        </Alert>
      </Card>
    );
  }
}

// ----------------------------------------------------------------- sections --

function FormSection({ section, store }) {
  return (
    <Card>
      <SectionHeader section={section} />
      <ObjectForm
        fields={section.fields}
        value={getIn(store.draft, section.path) || {}}
        onChange={(next) => store.update(section.path, next)}
      />
    </Card>
  );
}

function ListSection({ section, store, go }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const raw = getIn(store.draft, section.path);
  const list = Array.isArray(raw) ? raw : [];

  const add = () => {
    store.update(section.path, (current) => [section.blank(), ...(current || [])]);
    go(section.id, 0); // new entries go on top: the site lists newest first
  };
  const duplicate = (i) => {
    store.update(section.path, (current) => {
      const copy = JSON.parse(JSON.stringify(current[i]));
      copy.title = `${copy.title || "Untitled"} (copy)`;
      return [...current.slice(0, i + 1), copy, ...current.slice(i + 1)];
    });
    go(section.id, i + 1);
  };
  const move = (i, delta) => store.update(section.path, (current) => moveItem(current, i, delta));
  const remove = (i) => {
    store.update(section.path, (current) => current.filter((_, idx) => idx !== i));
    setPendingDelete(null);
  };

  const target = pendingDelete === null ? null : list[pendingDelete];

  return (
    <Stack spacing={4}>
      <Card>
        <SectionHeader section={section} />
        {section.headerFields && (
          <Box mb={5}>
            <ObjectForm
              fields={section.headerFields}
              value={getIn(store.draft, section.headerPath) || {}}
              onChange={(next) => store.update(section.headerPath, next)}
            />
          </Box>
        )}
        <Flex justify="space-between" align="center">
          <Text fontWeight="600">{list.length} {section.noun}{list.length === 1 ? "" : "s"}</Text>
          <Button size="sm" colorScheme="green" leftIcon={<FontAwesomeIcon icon={faPlus} />} onClick={add}>
            Add {section.noun}
          </Button>
        </Flex>
        <Text fontSize="xs" color="gray.500" mt={1}>
          New entries are added at the top (the site lists newest first). Use the arrows to reorder.
        </Text>
      </Card>

      {list.length === 0 && (
        <Card><Text color="gray.500" textAlign="center">Nothing here yet.</Text></Card>
      )}

      {list.map((item, i) => {
        const { title, subtitle, meta } = section.summarize(item);
        return (
          <Flex key={i} bg="white" borderWidth="1px" rounded="lg" p={3} align="center" gap={3} shadow="sm">
            <Text color="gray.400" w="24px" textAlign="center" flexShrink={0}>{i + 1}</Text>
            <Box as="button" type="button" flex="1" minW={0} textAlign="left" onClick={() => go(section.id, i)}
              aria-label={`Edit ${title}`}>
              <Text fontWeight="600" noOfLines={1}>{title}</Text>
              {subtitle && <Text fontSize="sm" color="gray.600" noOfLines={1}>{subtitle}</Text>}
            </Box>
            {meta && <Text fontSize="xs" color="gray.500" display={{ base: "none", md: "block" }} flexShrink={0}>{meta}</Text>}
            <HStack spacing={0} flexShrink={0}>
              <IconBtn icon={faPen} label={`Edit ${title}`} onClick={() => go(section.id, i)} />
              <IconBtn icon={faCopy} label={`Duplicate ${title}`} onClick={() => duplicate(i)} />
              <IconBtn icon={faArrowUp} label={`Move ${title} up`} isDisabled={i === 0} onClick={() => move(i, -1)} />
              <IconBtn icon={faArrowDown} label={`Move ${title} down`} isDisabled={i === list.length - 1} onClick={() => move(i, 1)} />
              <IconBtn icon={faTrash} label={`Delete ${title}`} colorScheme="red" onClick={() => setPendingDelete(i)} />
            </HStack>
          </Flex>
        );
      })}

      <ConfirmDialog
        isOpen={target !== null && target !== undefined}
        title={`Delete this ${section.noun}?`}
        confirmLabel="Delete"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => remove(pendingDelete)}
      >
        “{target ? section.summarize(target).title : ""}” will be removed from the draft. Nothing is written to
        data.json until you press Save, and “Discard changes” brings it back.
      </ConfirmDialog>
    </Stack>
  );
}

function ItemEditor({ section, index, store, go }) {
  const raw = getIn(store.draft, section.path);
  const item = Array.isArray(raw) ? raw[index] : undefined;

  if (!item) {
    return (
      <Card>
        <Text mb={3}>That {section.noun} doesn't exist (it may have been deleted).</Text>
        <Button onClick={() => go(section.id)}>Back to {section.label.toLowerCase()}</Button>
      </Card>
    );
  }
  return (
    <Card>
      <Button variant="link" size="sm" colorScheme="green" leftIcon={<FontAwesomeIcon icon={faArrowLeft} />}
        onClick={() => go(section.id)}>
        All {section.label.toLowerCase()}
      </Button>
      <Flex justify="space-between" align="baseline" gap={3} my={4} wrap="wrap">
        <Heading size="md">{item.title || `New ${section.noun}`}</Heading>
        <Text fontSize="sm" color="gray.500">{section.noun} #{index + 1}</Text>
      </Flex>
      <ObjectForm
        fields={section.fields}
        value={item}
        onChange={(next) => store.update([...section.path, index], next)}
      />
      <Flex mt={8} gap={3}>
        <Button colorScheme="green" variant="outline" onClick={() => go(section.id)}>Done</Button>
      </Flex>
    </Card>
  );
}

function RawEditor({ store }) {
  const pretty = JSON.stringify(store.draft, null, 2);
  const [text, setText] = useState(pretty);
  const [error, setError] = useState(null);
  const inSync = text === pretty;

  const apply = () => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("The top level must be an object.");
      }
      store.replaceAll(parsed);
      setText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Card>
      <SectionHeader section={findSection("raw")} />
      <Textarea fontFamily="mono" fontSize="xs" rows={28} spellCheck={false} aria-label="data.json contents"
        value={text} onChange={(e) => setText(e.target.value)} />
      {error && <Alert status="error" rounded="md" mt={3}><AlertIcon />{error}</Alert>}
      <HStack mt={3}>
        <Button colorScheme="green" size="sm" isDisabled={inSync} onClick={apply}>Apply to draft</Button>
        <Button size="sm" variant="ghost" isDisabled={inSync} onClick={() => { setText(pretty); setError(null); }}>
          Reset text
        </Button>
        <Text fontSize="xs" color="gray.500">
          Applying only changes the draft; you still press Save. The saved file keeps its current formatting.
        </Text>
      </HStack>
    </Card>
  );
}

// -------------------------------------------------------------------- shell --

function Nav({ section, data, go }) {
  return (
    <Stack as="nav" aria-label="Sections" spacing={1} w={{ base: "100%", md: "210px" }} flexShrink={0}
      position={{ md: "sticky" }} top="84px">
      {SECTIONS.map((s) => {
        const count = countItems(data, s);
        const active = s.id === section.id;
        return (
          <Button key={s.id} justifyContent="space-between" variant={active ? "solid" : "ghost"}
            colorScheme={active ? "green" : "gray"} size="sm" aria-current={active ? "page" : undefined}
            onClick={() => go(s.id)}>
            <span>{s.label}</span>
            {count !== null && <Badge ml={2} colorScheme={active ? "whiteAlpha" : "gray"}>{count}</Badge>}
          </Button>
        );
      })}
    </Stack>
  );
}

function ConflictDialog({ store }) {
  const cancelRef = useRef();
  return (
    <AlertDialog isOpen={Boolean(store.conflict)} leastDestructiveRef={cancelRef} onClose={store.dismissConflict}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">data.json changed on disk</AlertDialogHeader>
          <AlertDialogBody>
            The file was modified (for example by git or an editor) after the admin loaded it. You can load the new
            version and lose your unsaved edits here, or overwrite the file with your edits.
          </AlertDialogBody>
          <AlertDialogFooter gap={2} flexWrap="wrap">
            <Button ref={cancelRef} onClick={store.dismissConflict}>Cancel</Button>
            <Button onClick={store.reload}>Load the file from disk</Button>
            <Button colorScheme="red" onClick={() => store.save(store.conflict.rev)}>Overwrite with my edits</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export default function Admin() {
  const store = useAdminData();
  const { section, index, go, pathname } = useAdminRoute();
  const toast = useToast();
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    const flash = takeFlash();
    if (flash) toast({ title: flash, status: "success", duration: 4000 });
  }, [toast]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (store.phase === "loading") {
    return <Flex minH="100vh" align="center" justify="center"><Spinner size="lg" /></Flex>;
  }
  if (store.phase === "error") {
    return (
      <Flex minH="100vh" align="center" justify="center" p={6}>
        <Stack maxW="520px" spacing={4}>
          <Alert status="error" rounded="md"><AlertIcon />{store.error}</Alert>
          <Button alignSelf="flex-start" onClick={store.reload}>Try again</Button>
        </Stack>
      </Flex>
    );
  }

  const problems = findProblems(store.draft);

  const onSave = async () => {
    const res = await store.save();
    if (res.ok) {
      toast({ title: res.changed ? "Saved to src/data.json" : "Nothing to save", status: "success", duration: 4000 });
    } else if (!res.conflict) {
      toast({
        title: "Could not save",
        description: [res.message, ...(res.details || [])].join(" "),
        status: "error", duration: 12000, isClosable: true,
      });
    }
  };

  let view;
  if (section.kind === "raw") view = <RawEditor store={store} />;
  else if (section.kind === "form") view = <FormSection section={section} store={store} />;
  else if (index !== null) view = <ItemEditor section={section} index={index} store={store} go={go} />;
  else view = <ListSection section={section} store={store} go={go} />;

  return (
    <Box minH="100vh" bg="gray.50" color="gray.800" textAlign="left" fontFamily="body" lineHeight="1.5">
      <Flex as="header" position="sticky" top={0} zIndex={20} bg="white" borderBottomWidth="1px"
        px={{ base: 3, md: 6 }} py={3} align="center" gap={3} wrap="wrap">
        <Heading size="md">Portfolio admin</Heading>
        <Badge colorScheme={store.dirty ? "orange" : "green"} data-testid="save-state">
          {store.dirty ? "Unsaved changes" : "All changes saved"}
        </Badge>
        <Box flex="1" />
        <Button as="a" href="/" target="_blank" rel="noreferrer" size="sm" variant="ghost"
          rightIcon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs" />}>
          View site
        </Button>
        <Button size="sm" variant="outline" leftIcon={<FontAwesomeIcon icon={faRotateLeft} />}
          isDisabled={!store.dirty} onClick={() => setConfirmDiscard(true)}>
          Discard changes
        </Button>
        <Button size="sm" colorScheme="green" leftIcon={<FontAwesomeIcon icon={faFloppyDisk} />}
          isDisabled={!store.dirty || problems.length > 0} isLoading={store.saving} onClick={onSave}>
          Save changes
        </Button>
      </Flex>

      <Flex direction={{ base: "column", md: "row" }} gap={6} px={{ base: 3, md: 6 }} py={6}
        maxW="1180px" mx="auto" align="flex-start">
        <Nav section={section} data={store.draft} go={go} />
        <Box flex="1" minW={0} w="100%">
          {store.restored && (
            <Alert status="info" rounded="md" mb={4} alignItems="center">
              <AlertIcon />
              <Text flex="1">Restored your unsaved changes from earlier.</Text>
              <Button size="sm" variant="outline" onClick={() => setConfirmDiscard(true)}>Discard them</Button>
            </Alert>
          )}
          {problems.length > 0 && (
            <Alert status="warning" rounded="md" mb={4} alignItems="flex-start">
              <AlertIcon />
              <Box>
                <AlertTitle>Fix these before saving</AlertTitle>
                <AlertDescription>
                  <Stack as="ul" spacing={1} mt={1} listStyleType="none">
                    {problems.slice(0, 6).map((p, i) => (
                      <li key={i}>
                        <Button variant="link" size="sm" textAlign="left" whiteSpace="normal" height="auto"
                          onClick={() => go(p.section, p.index)}>
                          {p.message}
                        </Button>
                      </li>
                    ))}
                    {problems.length > 6 && <li>…and {problems.length - 6} more.</li>}
                  </Stack>
                </AlertDescription>
              </Box>
            </Alert>
          )}
          <SectionBoundary key={`${section.id}/${index}`}>{view}</SectionBoundary>
        </Box>
      </Flex>

      <ConfirmDialog isOpen={confirmDiscard} title="Discard all unsaved changes?" confirmLabel="Discard"
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => { store.discard(); setConfirmDiscard(false); }}>
        Your edits since the last save will be thrown away. The saved file is not touched.
      </ConfirmDialog>
      <ConflictDialog store={store} />
    </Box>
  );
}
