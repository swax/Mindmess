import gptModels, { GptModelName } from "@/utils/gptModels";
import { tabInput } from "@/utils/textEditing";
import { Box, Button, Stack, Tooltip } from "@mui/material";
import { useRef, useState } from "react";
import { ParrotCheckResult } from "../actions/InputActionResponse";
import { parrotCheckAction } from "../actions/parrot-check-action";
import NoteField from "../components/NoteField";
import { FocusType } from "../page";

interface ParrotCheckPanelProps {
  input: string;
  currentNote: string | undefined;
  gptModelName: GptModelName;
  stagedNote: string;
  loading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setInput: (input: string) => void;
  setFocus: (focus: FocusType | null) => void;
  setLoading: (loading: boolean) => void;
  updateUsageReport: (inputTokens: number, outputTokens: number) => void;
}

export default function ParrotCheckPanel({
  input,
  currentNote,
  gptModelName,
  stagedNote,
  loading,
  inputRef,
  setInput,
  setFocus,
  setLoading,
  updateUsageReport,
}: ParrotCheckPanelProps) {
  const [parrotReport, setParrotReport] = useState<ParrotCheckResult[]>([]);
  const runNumber = useRef(0);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      tabInput(e.currentTarget);
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

    const response = await parrotCheckAction(
      input,
      existingNotes,  
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

    setParrotReport(response.parrotReport);
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
        placeholder="Enter the context on the left and text here to find out the predictability of each word in the text."
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
            {loading ? "Working... " : "Run Parrot Check"}
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
      <Box sx={{ fontSize: 12, marginTop: 1, color: "text.secondary" }}>
        Careful as this will run an API call for every word in the sentence
        using the gpt-3.5-turbo-instruct model.
      </Box>
      <Box sx={{ marginTop: 2 }}>
        {parrotReport.map((pr, i) => (
          <Tooltip
            key={i}
            title={
              <Box>
                <Box>
                  {pr.probability
                    ? `Matched: "${pr.match}" with probability ${pr.probability.toFixed(0)}%`
                    : "Not predicted"}
                </Box>
                <Box sx={{ marginTop: 1 }}>Word Predictions:</Box>
                {pr.other_words.map((ow, j) => (
                  <Box key={j} sx={{ marginLeft: 1 }}>
                    {ow.word}: {ow.probability.toFixed(0)}%
                  </Box>
                ))}
                <Box sx={{ marginTop: 1 }}>
                  Text Prediction: &quot;{pr.predictedText}&quot;
                </Box>
              </Box>
            }
          >
            <Box
              component="span"
              sx={{
                color:
                  pr.probability > 90
                    ? "pink"
                    : pr.probability > 70
                      ? "cyan"
                      : pr.probability > 50
                        ? "limegreen"
                        : pr.probability > 30
                          ? "yellow"
                          : pr.probability > 0
                            ? "orange"
                            : "red",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#555" },
              }}
            >
              {pr.word}{" "}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </>
  );
}
