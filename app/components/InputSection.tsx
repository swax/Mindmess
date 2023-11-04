import { tabInput } from "@/utils/textEditing";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Button,
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

interface InputSectionProps {
  currentNote?: string;
  input: string;
  focus: FocusType;
  loading: boolean;
  setFocus: (focus: FocusType) => void;
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
  const [inputTab, setInputTab] = useState<"merge" | "command" | "question">(
    "merge"
  );

  const [chatLog, setChatLog] = useState<
    OpenAI.Chat.Completions.ChatCompletionMessage[]
  >([]);

  const runNumber = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focus === "input") {
      inputRef.current?.focus();
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

    const response =
      inputTab == "merge"
        ? await mergeAction(input, currentNote || "")
        : inputTab == "command"
        ? await commandAction(input, currentNote || "")
        : inputTab == "question"
        ? await questionAction(input, currentNote || "", chatLog)
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

  // Rendering
  return (
    <>
      <Tabs value={inputTab} onChange={(e, v) => setInputTab(v)}>
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
          onKeyDown: handleKeyDown_input,
        }}
        inputRef={inputRef}
        minRows={3}
        onChange={(e) => setInput(e.target.value)}
        value={input}
      />
      <Stack direction="row" spacing={1}>
        <Button
          disabled={loading || !input || Boolean(stagedNote)}
          onClick={handleClick_runInput}
          variant="outlined"
        >
          {loading ? "Working... " : "Run " + inputTab}
        </Button>
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
      </Stack>
    </>
  );
}
