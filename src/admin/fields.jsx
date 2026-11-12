import React, { useEffect, useRef, useState } from "react";
import {
  Box, Button, Checkbox, Flex, FormControl, FormHelperText, FormLabel, HStack, IconButton, Image, Input,
  Select, Stack, Switch, Tag, TagLabel, Text, Textarea, Tooltip, Wrap, WrapItem, useDisclosure,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown, faArrowUp, faChevronLeft, faChevronRight, faImage, faPlus, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ImagePicker from "./ImagePicker";
import { moveItem, setField } from "./schema";
import { MONTHS, formatRange, parseRange } from "./dates";

// ----------------------------------------------------------------- shared ---

export function IconBtn({ icon, label, ...props }) {
  return (
    <Tooltip label={label} hasArrow openDelay={500}>
      <IconButton
        aria-label={label}
        icon={<FontAwesomeIcon icon={icon} />}
        size="xs"
        variant="ghost"
        {...props}
      />
    </Tooltip>
  );
}

function RowControls({ index, count, label, onMove, onRemove }) {
  return (
    <HStack spacing={0} flexShrink={0}>
      <IconBtn icon={faArrowUp} label={`Move ${label} up`} isDisabled={index === 0} onClick={() => onMove(-1)} />
      <IconBtn icon={faArrowDown} label={`Move ${label} down`} isDisabled={index === count - 1} onClick={() => onMove(1)} />
      <IconBtn icon={faXmark} label={`Remove ${label}`} colorScheme="red" onClick={onRemove} />
    </HStack>
  );
}

const Marks = ({ field }) => (
  <>
    {field.required && <Text as="span" color="red.500"> *</Text>}
    {field.optional && <Text as="span" color="gray.400" fontWeight="400"> (optional)</Text>}
  </>
);

/** Label + one input. Uses FormControl, so only for fields with a single input. */
function SingleShell({ field, note, children }) {
  return (
    <FormControl>
      <FormLabel fontSize="sm" fontWeight="600" mb={1}>
        {field.label}
        <Marks field={field} />
      </FormLabel>
      {children}
      {note && <FormHelperText color="red.500" fontSize="xs">{note}</FormHelperText>}
      {field.help && <FormHelperText fontSize="xs">{field.help}</FormHelperText>}
    </FormControl>
  );
}

/** Label + several inputs (lists, nested objects): no FormControl, so no duplicate ids. */
function GroupShell({ field, children }) {
  return (
    <Box role="group" aria-label={field.label}>
      <Text fontSize="sm" fontWeight="600" mb={1}>
        {field.label}
        <Marks field={field} />
      </Text>
      {field.help && <Text fontSize="xs" color="gray.600" mb={2}>{field.help}</Text>}
      {children}
    </Box>
  );
}

const previewSrc = (path) => (/^(https?:)?\/\//.test(path) || path.startsWith("/") ? path : `/${path}`);

function Thumb({ path, size = "56px" }) {
  return (
    <Flex w={size} h={size} flexShrink={0} align="center" justify="center" bg="gray.100" rounded="md" overflow="hidden" borderWidth="1px">
      {path ? (
        <Image src={previewSrc(path)} maxW="100%" maxH="100%" objectFit="contain" alt=""
          fallback={<FontAwesomeIcon icon={faImage} color="#A0AEC0" />} />
      ) : (
        <FontAwesomeIcon icon={faImage} color="#A0AEC0" />
      )}
    </Flex>
  );
}

const rowsFor = (text = "") =>
  Math.max(2, Math.min(12, Math.ceil(text.length / 95) + (text.split("\n").length - 1)));

// ------------------------------------------------------------ single values --

function TextField({ field, value, onChange }) {
  const looksWrong = field.type === "url" && value && !/^(https?:\/\/|mailto:|\/|#)/i.test(value);
  return (
    <SingleShell field={field} note={looksWrong ? "Links normally start with https://" : null}>
      <Input size="sm" value={value ?? ""} placeholder={field.placeholder}
        isInvalid={Boolean(looksWrong)} onChange={(e) => onChange(e.target.value)} />
    </SingleShell>
  );
}

function DatePart({ label, part, disabled, onChange }) {
  return (
    <Flex gap={2} align="center">
      <Select size="sm" bg="white" w="110px" aria-label={`${label} month`} isDisabled={disabled}
        value={part.month} onChange={(e) => onChange({ ...part, month: Number(e.target.value) })}>
        <option value={0}>Month</option>
        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </Select>
      <Input size="sm" bg="white" w="84px" inputMode="numeric" maxLength={4} placeholder="Year"
        aria-label={`${label} year`} isDisabled={disabled} value={part.year}
        onChange={(e) => onChange({ ...part, year: e.target.value.replace(/\D/g, "") })} />
    </Flex>
  );
}

/** Start / end month + year (month optional) and a "Present" switch. Writes the same text style as before. */
function DateRangeField({ field, value, onChange }) {
  const [parts, setParts] = useState(() => parseRange(value));
  const [asText, setAsText] = useState(() => parseRange(value) === null);
  const lastEmitted = useRef(value || "");

  useEffect(() => {
    // The value changed from outside (discard, raw editor, another item): re-read it.
    if ((value || "") === lastEmitted.current) return;
    const parsed = parseRange(value);
    setParts(parsed);
    setAsText(parsed === null);
    lastEmitted.current = value || "";
  }, [value]);

  const emit = (text) => {
    lastEmitted.current = text;
    onChange(text);
  };
  const update = (next) => {
    setParts(next);
    emit(formatRange(next));
  };

  if (asText || !parts) {
    return (
      <SingleShell field={field}
        note={!parts ? "This text doesn't look like a date range, so it is shown as plain text." : null}>
        <Flex gap={2}>
          <Input size="sm" value={value ?? ""} placeholder={field.placeholder}
            onChange={(e) => emit(e.target.value)} />
          {parseRange(value) && (
            <Button size="sm" variant="outline" flexShrink={0}
              onClick={() => { setParts(parseRange(value)); setAsText(false); }}>
              Use date fields
            </Button>
          )}
        </Flex>
      </SingleShell>
    );
  }

  return (
    <Box role="group" aria-label={field.label}>
      <Text fontSize="sm" fontWeight="600" mb={1}>{field.label}</Text>
      <Flex gap={4} wrap="wrap" align="center">
        <Box>
          <Text fontSize="xs" color="gray.600" mb={1}>From</Text>
          <DatePart label="Start" part={parts.start} onChange={(p) => update({ ...parts, start: p })} />
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.600" mb={1}>To</Text>
          <DatePart label="End" part={parts.end} disabled={parts.present}
            onChange={(p) => update({ ...parts, end: p })} />
        </Box>
        <Checkbox size="sm" mt={5} isChecked={parts.present}
          onChange={(e) => update({ ...parts, present: e.target.checked })}>
          Present
        </Checkbox>
      </Flex>
      <Text fontSize="xs" color="gray.600" mt={1}>
        Shown on the site as “{formatRange(parts) || "…"}”. Month is optional (leave it as “Month” for years only).{" "}
        <Button variant="link" size="xs" colorScheme="green" onClick={() => setAsText(true)}>Edit as text</Button>
      </Text>
    </Box>
  );
}

function LongTextField({ field, value, onChange }) {
  return (
    <SingleShell field={field}>
      <Textarea size="sm" resize="vertical" rows={rowsFor(value)} value={value ?? ""}
        placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
    </SingleShell>
  );
}

function BoolField({ field, value, onChange }) {
  return (
    <FormControl>
      <Flex align="center" gap={3}>
        <Switch isChecked={Boolean(value)} colorScheme="green" onChange={(e) => onChange(e.target.checked)} />
        <FormLabel fontSize="sm" fontWeight="600" m={0}>{field.label}</FormLabel>
      </Flex>
      {field.help && <FormHelperText fontSize="xs">{field.help}</FormHelperText>}
    </FormControl>
  );
}

function ImageField({ field, value, onChange, item }) {
  const picker = useDisclosure();
  return (
    <SingleShell field={field}>
      <Flex gap={3} align="center">
        <Thumb path={value} />
        <Input size="sm" value={value ?? ""} placeholder="/path/in/public.png" onChange={(e) => onChange(e.target.value)} />
        <Button size="sm" flexShrink={0} onClick={picker.onOpen}>Choose…</Button>
        {value ? <IconBtn icon={faXmark} label={`Clear ${field.label}`} onClick={() => onChange("")} /> : null}
      </Flex>
      <ImagePicker isOpen={picker.isOpen} onClose={picker.onClose}
        uploadDir={field.uploadDir ? field.uploadDir(item) : ""}
        onPick={([path]) => onChange(path)} />
    </SingleShell>
  );
}

// -------------------------------------------------------------------- lists --

/** Focus the newest row after "Add", so you can type straight away. */
function useFocusNewRow(count) {
  const container = useRef(null);
  const pending = useRef(false);
  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    const inputs = container.current && container.current.querySelectorAll("textarea, input");
    if (inputs && inputs.length) inputs[inputs.length - 1].focus();
  }, [count]);
  return { container, markAdded: () => { pending.current = true; } };
}

function StringsField({ field, value, onChange }) {
  const list = value || [];
  const noun = field.itemLabel || "item";
  const { container, markAdded } = useFocusNewRow(list.length);
  const Control = field.multiline ? Textarea : Input;

  return (
    <GroupShell field={field}>
      <Stack spacing={2} ref={container}>
        {list.map((entry, i) => (
          <Flex key={i} gap={1} align="flex-start">
            <Text fontSize="xs" color="gray.500" w="20px" pt={2} flexShrink={0} textAlign="right">{i + 1}</Text>
            <Control
              size="sm"
              aria-label={`${field.label} ${i + 1}`}
              value={entry}
              {...(field.multiline ? { resize: "vertical", rows: rowsFor(entry) } : {})}
              onChange={(e) => onChange(list.map((x, idx) => (idx === i ? e.target.value : x)))}
            />
            <RowControls index={i} count={list.length} label={`${noun} ${i + 1}`}
              onMove={(d) => onChange(moveItem(list, i, d))}
              onRemove={() => onChange(list.filter((_, idx) => idx !== i))} />
          </Flex>
        ))}
      </Stack>
      <Button size="xs" mt={2} leftIcon={<FontAwesomeIcon icon={faPlus} />}
        onClick={() => { markAdded(); onChange([...list, ""]); }}>
        Add {noun}
      </Button>
    </GroupShell>
  );
}

function TagsField({ field, value, onChange }) {
  const list = value || [];
  const [draft, setDraft] = useState("");
  const commit = () => {
    const entry = draft.trim();
    if (entry) onChange([...list, entry]);
    setDraft("");
  };
  return (
    <GroupShell field={field}>
      {list.length > 0 && (
        <Wrap spacing={2} mb={2}>
          {list.map((entry, i) => (
            <WrapItem key={i}>
              <Tag size="md" colorScheme="blue" variant="subtle">
                <IconBtn icon={faChevronLeft} label={`Move ${entry} earlier`} isDisabled={i === 0}
                  h="18px" minW="18px" onClick={() => onChange(moveItem(list, i, -1))} />
                <TagLabel mx={1}>{entry}</TagLabel>
                <IconBtn icon={faChevronRight} label={`Move ${entry} later`} isDisabled={i === list.length - 1}
                  h="18px" minW="18px" onClick={() => onChange(moveItem(list, i, 1))} />
                <IconBtn icon={faXmark} label={`Remove ${entry}`} colorScheme="red"
                  h="18px" minW="18px" onClick={() => onChange(list.filter((_, idx) => idx !== i))} />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      )}
      <HStack>
        <Input size="sm" maxW="320px" aria-label={`Add to ${field.label}`} placeholder="Type and press Enter"
          value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }} />
        <Button size="sm" onClick={commit} isDisabled={!draft.trim()}>Add</Button>
      </HStack>
    </GroupShell>
  );
}

function ImagesField({ field, value, onChange, item }) {
  const list = value || [];
  const picker = useDisclosure();
  return (
    <GroupShell field={field}>
      <Stack spacing={2}>
        {list.map((path, i) => (
          <Flex key={i} gap={2} align="center">
            <Thumb path={path} />
            <Input size="sm" aria-label={`${field.label} ${i + 1}`} value={path}
              onChange={(e) => onChange(list.map((x, idx) => (idx === i ? e.target.value : x)))} />
            <RowControls index={i} count={list.length} label={`image ${i + 1}`}
              onMove={(d) => onChange(moveItem(list, i, d))}
              onRemove={() => onChange(list.filter((_, idx) => idx !== i))} />
          </Flex>
        ))}
      </Stack>
      <Button size="xs" mt={2} leftIcon={<FontAwesomeIcon icon={faPlus} />} onClick={picker.onOpen}>
        Add images…
      </Button>
      <ImagePicker isOpen={picker.isOpen} onClose={picker.onClose} multiple
        uploadDir={field.uploadDir ? field.uploadDir(item) : ""}
        onPick={(paths) => onChange([...list, ...paths.filter((p) => !list.includes(p))])} />
    </GroupShell>
  );
}

function SelectField({ field, value, onChange }) {
  return (
    <SingleShell field={field}>
      <Select size="sm" bg="white" value={value || field.options[0].value} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
    </SingleShell>
  );
}

function ObjectsField({ field, value, onChange }) {
  const list = value || [];
  const noun = field.itemLabel || "item";
  return (
    <GroupShell field={field}>
      <Stack spacing={3}>
        {list.map((entry, i) => (
          <Box key={i} borderWidth="1px" rounded="md" p={3} bg="white">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="xs" fontWeight="700" textTransform="uppercase" color="gray.500">
                {noun} {i + 1}
              </Text>
              <RowControls index={i} count={list.length} label={`${noun} ${i + 1}`}
                onMove={(d) => onChange(moveItem(list, i, d))}
                onRemove={() => onChange(list.filter((_, idx) => idx !== i))} />
            </Flex>
            <ObjectForm fields={field.fields} value={entry}
              onChange={(next) => onChange(list.map((x, idx) => (idx === i ? next : x)))} />
          </Box>
        ))}
      </Stack>
      <Button size="xs" mt={2} leftIcon={<FontAwesomeIcon icon={faPlus} />}
        onClick={() => onChange([...list, field.blank()])}>
        Add {noun}
      </Button>
    </GroupShell>
  );
}

function ObjectField({ field, value, onChange }) {
  if (value === undefined || value === null) {
    return (
      <GroupShell field={field}>
        <Button size="xs" leftIcon={<FontAwesomeIcon icon={faPlus} />} onClick={() => onChange(field.blank())}>
          Add {field.label.toLowerCase()}
        </Button>
      </GroupShell>
    );
  }
  return (
    <GroupShell field={field}>
      <Box borderWidth="1px" rounded="md" p={3} bg="white">
        <ObjectForm fields={field.fields} value={value} onChange={onChange} />
        <Button size="xs" mt={3} variant="outline" colorScheme="red" onClick={() => onChange(undefined)}>
          Remove {field.label.toLowerCase()}
        </Button>
      </Box>
    </GroupShell>
  );
}

// --------------------------------------------------------------- dispatcher --

export function Field({ field, value, onChange, item }) {
  switch (field.type) {
    case "text":
    case "url":
      return <TextField field={field} value={value} onChange={onChange} />;
    case "daterange":
      return <DateRangeField field={field} value={value} onChange={onChange} />;
    case "select":
      return <SelectField field={field} value={value} onChange={onChange} />;
    case "longtext":
      return <LongTextField field={field} value={value} onChange={onChange} />;
    case "bool":
      return <BoolField field={field} value={value} onChange={onChange} />;
    case "image":
      return <ImageField field={field} value={value} onChange={onChange} item={item} />;
    case "strings":
      return <StringsField field={field} value={value} onChange={onChange} />;
    case "tags":
      return <TagsField field={field} value={value} onChange={onChange} />;
    case "images":
      return <ImagesField field={field} value={value} onChange={onChange} item={item} />;
    case "objects":
      return <ObjectsField field={field} value={value} onChange={onChange} />;
    case "object":
      return <ObjectField field={field} value={value} onChange={onChange} />;
    default:
      return <Text color="red.500">Unknown field type “{field.type}”.</Text>;
  }
}

/**
 * Renders every field of an object. Keys the schema doesn't know about are left
 * untouched, so editing never drops data the forms don't cover.
 */
export function ObjectForm({ fields, value, onChange, item }) {
  return (
    <Stack spacing={4}>
      {fields.map((field) => (
        <Field key={field.key} field={field} value={value[field.key]} item={item || value}
          onChange={(next) => onChange(setField(value, field, next))} />
      ))}
    </Stack>
  );
}
