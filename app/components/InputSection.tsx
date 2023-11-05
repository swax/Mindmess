import gptModels, { GPTModel } from "@/utils/gptModels";
import { tabInput } from "@/utils/textEditing";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Box,
  Button,
  Chip,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableCell,
  TableRow,
  Tabs,
} from "@mui/material";
import OpenAI from "openai";
import { useEffect, useRef, useState } from "react";
import { commandAction } from "../actions/command-action";
import { mergeAction } from "../actions/merge-action";
import { questionAction } from "../actions/question-action";
import { FocusType, OutputTabType } from "../page";
import BaseTextField from "./BaseTextField";

type InputTabType = "merge" | "command" | "question";

interface InputSectionProps {
  currentNote?: string;
  input: string;
  focus: FocusType | null;
  loading: boolean;
  setFocus: (focus: FocusType | null) => void;
  setInput: (input: string) => void;
  setLoading: (loading: boolean) => void;
  setStagedNote: (note: string) => void;
  setOutputTab: (tab: OutputTabType) => void;
  stagedNote: string;
}

export default function InputSection({
  currentNote,
  focus,
  input,
  loading,
  setFocus,
  setInput,
  setLoading,
  setStagedNote,
  setOutputTab,
  stagedNote,
}: InputSectionProps) {
  // Hooks
  const [inputTab, setInputTab] = useState<InputTabType>("merge");

  const [chatLog, setChatLog] = useState<
    OpenAI.Chat.Completions.ChatCompletionMessage[]
  >([]);

  const [gptModel, setGptModel] = useState<GPTModel>(gptModels[0]);
  const [modelMenuAnchorEl, setModelMenuAnchorEl] = useState<HTMLDivElement>();
  const modelMenuOpen = Boolean(modelMenuAnchorEl);

  const [usageReport, setUsageReport] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number>(0);

  const runNumber = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focus === "input") {
      inputRef.current?.focus();
      setFocus(null);
    }
  }, [focus]);

  // Event Handlers
  function handleKeyDown_input(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      tabInput(e.currentTarget);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleClick_runInput();
    }
  }

  async function handleClick_runInput() {
    setLoading(true);
    setFocus("none");

    const runNumberCheck = runNumber.current;
    const existingNotes = currentNote || "";

    const response =
      inputTab == "merge"
        ? await mergeAction(input, existingNotes, gptModel.name)
        : inputTab == "command"
        ? await commandAction(input, existingNotes, gptModel.name)
        : inputTab == "question"
        ? await questionAction(input, existingNotes, chatLog, gptModel.name)
        : undefined;

    // Check if this run was cancelled
    if (!response || runNumberCheck != runNumber.current) {
      return;
    }

    setLoading(false);

    if (response.error) {
      alert(response.error);
      return;
    }

    let cost =
      (response.inputTokens * gptModel.costPer1kInput) / 1000 +
      (response.outputTokens * gptModel.costPer1kOutput) / 1000;
    setUsageReport(
      `Last Run: Input ${response.inputTokens} tokens, output ${
        response.outputTokens
      } tokens. Cost $${cost.toFixed(4)}`,
    );
    setTotalCost(totalCost + cost);

    if (inputTab == "question") {
      setChatLog([...chatLog, ...response.chatLog]);
      setInput("");
      setFocus("input");
    } else {
      setStagedNote(response.newNote);
      setFocus("accept");
      setOutputTab("staging");
    }
  }

  function handleClick_cancelRunInput() {
    setLoading(false);
    setFocus("input");
    runNumber.current++;
  }

  function handleChange_inputTab(
    e: React.ChangeEvent<{}>,
    value: InputTabType,
  ) {
    setInputTab(value);
    setFocus("input");
  }

  // Rendering
  return (
    <>
      <Tabs value={inputTab} onChange={handleChange_inputTab}>
        <Tab value="merge" label="Merge" />
        <Tab value="command" label="Command" />
        <Tab value="question" label="Question" />
      </Tabs>
      {inputTab == "question" && (
        <Paper>
          <Table sx={{ marginTop: 1 }}>
            {chatLog.map((message, i) => (
              <TableRow key={i}>
                <TableCell sx={{ width: 24, verticalAlign: "top" }}>
                  {message.role == "assistant" ? (
                    <SmartToyIcon />
                  ) : (
                    <PersonIcon />
                  )}
                </TableCell>
                <TableCell sx={{ sverticalAlign: "top" }}>
                  <pre
                    style={{
                      fontFamily: "Calibri",
                      fontSize: 14,
                      lineHeight: 1.3,
                      margin: 0,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {message.content}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Paper>
      )}

      <BaseTextField
        disabled={loading || Boolean(stagedNote)}
        inputProps={{
          "aria-label": "Input",
          onKeyDown: handleKeyDown_input,
        }}
        inputRef={inputRef}
        minRows={3}
        onChange={(e) => setInput(e.target.value)}
        value={input}
      />
      {/* Run Buttons */}
      <Stack alignItems="center" direction="row" spacing={1}>
        {!Boolean(stagedNote) && (
          <Button
            disabled={loading || !input}
            onClick={handleClick_runInput}
            variant="outlined"
          >
            {loading ? "Working... " : "Run " + inputTab}
          </Button>
        )}
        {loading && (
          <Button
            color="error"
            onClick={handleClick_cancelRunInput}
            variant="outlined"
          >
            Cancel
          </Button>
        )}
        {!loading && inputTab == "question" && chatLog.length > 0 && (
          <Button onClick={() => setChatLog([])} variant="outlined">
            Clear Chat
          </Button>
        )}
        {Boolean(stagedNote) && <Box>⬅️ Review Changes</Box>}
      </Stack>

      {/* Model Selection */}
      <Chip
        label={"Using " + gptModel.description}
        onClick={(e) => setModelMenuAnchorEl(e.currentTarget)}
        size="small"
        sx={{ marginTop: 2 }}
      />
      <Menu
        anchorEl={modelMenuAnchorEl}
        onClose={() => setModelMenuAnchorEl(undefined)}
        open={modelMenuOpen}
      >
        {gptModels.map((model, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              setGptModel(model);
              setModelMenuAnchorEl(undefined);
            }}
          >
            <Stack>
              <Box>{model.description}</Box>
              <Box sx={{ fontSize: 12, color: "text.secondary" }}>
                Input ${model.costPer1kInput}, Output ${model.costPer1kOutput}{" "}
                per 1k tokens
              </Box>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
      {/* Usage Report */}
      {totalCost > 0 && (
        <Box sx={{ marginTop: 2 }}>
          <Box sx={{ fontSize: 12, color: "text.secondary" }}>
            {usageReport}
          </Box>
          <Box sx={{ fontSize: 12, color: "text.secondary" }}>
            Running Total Cost: ${totalCost.toFixed(4)}
          </Box>
        </Box>
      )}
    </>
  );
}
