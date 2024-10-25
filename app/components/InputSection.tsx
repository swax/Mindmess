import gptModels, { GptModelName } from "@/utils/gptModels";
import { tabInput } from "@/utils/textEditing";
import useLocalStorageSsr from "@/utils/useLocalStorageSsr";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Box,
  Button,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
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
import ModelSelection from "./ModelSelection";
import NoteField from "./NoteField";

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
  const [inputTab, setInputTab] = useLocalStorageSsr<InputTabType>(
    "inputTab",
    "merge",
  );

  const [chatLog, setChatLog] = useState<
    OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  >([]);

  const [gptModelName, setGptModelName, gptModelLoaded] =
    useLocalStorageSsr<GptModelName>("gptModel", "gpt-4o");

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
    const gptModel = gptModels.find((model) => model.name == gptModelName);
    if (!gptModel) {
      alert("Error: Model not found");
      return;
    }

    setLoading(true);
    setFocus("none");

    const runNumberCheck = runNumber.current;
    const existingNotes = currentNote || "";

    const response =
      inputTab == "merge"
        ? await mergeAction(input, existingNotes, gptModelName)
        : inputTab == "command"
          ? await commandAction(input, existingNotes, gptModelName)
          : inputTab == "question"
            ? await questionAction(input, existingNotes, chatLog, gptModelName)
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
      (response.inputTokens * gptModel.costPer1MInput) / 1_000_000 +
      (response.outputTokens * gptModel.costPer1MOutput) / 1_000_000;
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

  function handleClick_clearChat() {
    setChatLog([]);
    setFocus("input");
  }

  // Rendering
  return (
    <>
      <Tabs onChange={handleChange_inputTab} value={inputTab}>
        <Tab label="Merge" value="merge" />
        <Tab label="Command" value="command" />
        <Tab label="Question" value="question" />
      </Tabs>
      {inputTab == "question" && Boolean(chatLog.length) && (
        <Paper>
          <Table sx={{ marginTop: 1 }}>
            <TableBody>
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
                        fontFamily: "Calibri, sans-serif",
                        fontSize: 14,
                        lineHeight: 1.3,
                        margin: 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {message.content?.toString()}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <NoteField
        disabled={loading || Boolean(stagedNote)}
        inputProps={{
          "aria-label": "Input",
          onKeyDown: handleKeyDown_input,
        }}
        inputRef={inputRef}
        minRows={3}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          inputTab == "merge"
            ? "Merge in new information while reorganizing and de-duplicating..."
            : inputTab == "command"
              ? "A command to change and update the current document..."
              : inputTab == "question"
                ? "Discuss your document with ChatGPT..."
                : ""
        }
        sx={{ marginTop: 1 }}
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
          <Button onClick={handleClick_clearChat} variant="outlined">
            Clear Chat
          </Button>
        )}
        {Boolean(stagedNote) && <Box>⬅️ Review Changes</Box>}
      </Stack>
      {gptModelLoaded && (
        <ModelSelection
          {...{
            gptModelName,
            setGptModelName,
            totalCost,
            usageReport,
          }}
        />
      )}
    </>
  );
}
