import gptModels, { GptModelName } from "@/utils/gptModels";
import { tabInput } from "@/utils/textEditing";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import OpenAI from "openai";
import { useState, useRef } from "react";
import { questionAction } from "../actions/question-action";
import { FocusType } from "../page";
import NoteField from "../components/NoteField";

interface QuestionPanelProps {
  input: string;
  currentNote: string | undefined;
  gptModelName: GptModelName;
  loading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setInput: (input: string) => void;
  setFocus: (focus: FocusType | null) => void;
  setLoading: (loading: boolean) => void;
  updateUsageReport: (inputTokens: number, outputTokens: number) => void;
}

export default function QuestionPanel({
  input,
  currentNote,
  gptModelName,
  loading,
  inputRef,
  setInput,
  setFocus,
  setLoading,
  updateUsageReport,
}: QuestionPanelProps) {
  const [chatLog, setChatLog] = useState<
    OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  >([]);
  const runNumber = useRef(0);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      tabInput(e.currentTarget);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRunInput();
    }
  }

  async function handleRunInput() {
    const gptModel = gptModels.find((model) => model.name == gptModelName);
    if (!gptModel) {
      alert("Error: Model not found");
      return;
    }

    setLoading(true);
    setFocus("none");

    const runNumberCheck = runNumber.current;
    const existingNotes = currentNote || "";

    const response = await questionAction(
      input,
      existingNotes,
      chatLog,
      gptModelName,
    );

    // Check if this run was cancelled
    if (!response || runNumberCheck != runNumber.current) {
      return;
    }

    setLoading(false);

    if (response.error) {
      alert(response.error);
      return;
    }

    updateUsageReport(response.inputTokens, response.outputTokens);

    setChatLog([...chatLog, ...response.chatLog]);
    setInput("");
    setFocus("input");
  }

  function handleCancelRunInput() {
    setLoading(false);
    setFocus("input");
    runNumber.current++;
  }

  function handleClearChat() {
    setChatLog([]);
    setFocus("input");
  }
  return (
    <>
      {Boolean(chatLog.length) && (
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
        disabled={loading}
        inputProps={{ "aria-label": "Input", onKeyDown: handleKeyDown }}
        inputRef={inputRef}
        minRows={3}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Discuss your document with ChatGPT..."
        sx={{ marginTop: 1 }}
        value={input}
      />
      <Stack alignItems="center" direction="row" spacing={1}>
        <Button
          disabled={loading || !input}
          onClick={handleRunInput}
          variant="outlined"
        >
          {loading ? "Working... " : "Run question"}
        </Button>
        {loading && (
          <Button
            color="error"
            onClick={handleCancelRunInput}
            variant="outlined"
          >
            Cancel
          </Button>
        )}
        {!loading && chatLog.length > 0 && (
          <Button onClick={handleClearChat} variant="outlined">
            Clear Chat
          </Button>
        )}
      </Stack>
    </>
  );
}
