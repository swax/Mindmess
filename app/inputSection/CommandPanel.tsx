import gptModels, { GptModelName } from "@/utils/gptModels";
import { tabInput } from "@/utils/textEditing";
import { Box, Button, Stack } from "@mui/material";
import { useRef } from "react";
import { commandAction } from "../actions/command-action";
import { FocusType, OutputTabType } from "../page";
import NoteField from "../components/NoteField";

interface CommandPanelProps {
  input: string;
  currentNote: string | undefined;
  gptModelName: GptModelName;
  stagedNote: string;
  loading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setInput: (input: string) => void;
  setFocus: (focus: FocusType | null) => void;
  setLoading: (loading: boolean) => void;
  setStagedNote: (note: string) => void;
  setOutputTab: (tab: OutputTabType) => void;
  updateUsageReport: (inputTokens: number, outputTokens: number) => void;
}

export default function CommandPanel({
  input,
  currentNote,
  gptModelName,
  stagedNote,
  loading,
  inputRef,
  setInput,
  setFocus,
  setLoading,
  setStagedNote,
  setOutputTab,
  updateUsageReport,
}: CommandPanelProps) {
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

    const response = await commandAction(input, existingNotes, gptModelName);

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

    setStagedNote(response.newNote);
    setFocus("accept");
    setOutputTab("staging");
  }

  function handleCancelRunInput() {
    setLoading(false);
    setFocus("input");
    runNumber.current++;
  }
  return (
    <>
      <NoteField
        disabled={loading || Boolean(stagedNote)}
        inputProps={{ "aria-label": "Input", onKeyDown: handleKeyDown }}
        inputRef={inputRef}
        minRows={3}
        onChange={(e) => setInput(e.target.value)}
        placeholder="A command to change and update the current document..."
        sx={{ marginTop: 1 }}
        value={input}
      />
      <Stack alignItems="center" direction="row" spacing={1}>
        {!Boolean(stagedNote) && (
          <Button
            disabled={loading || !input}
            onClick={handleRunInput}
            variant="outlined"
          >
            {loading ? "Working... " : "Run command"}
          </Button>
        )}
        {loading && (
          <Button
            color="error"
            onClick={handleCancelRunInput}
            variant="outlined"
          >
            Cancel
          </Button>
        )}
        {Boolean(stagedNote) && <Box>⬅️ Review Changes</Box>}
      </Stack>
    </>
  );
}
