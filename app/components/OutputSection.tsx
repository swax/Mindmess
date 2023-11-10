import { tabInput } from "@/utils/textEditing";
import { Box } from "@mui/material";
import ReactDiffViewer from "react-diff-viewer-continued";
import Markdown from "react-markdown";
import { MindmessSettings, OutputTabType } from "../page";
import NoteField from "./NoteField";

interface OutputSectionProps {
  currentNote?: string;
  currentNoteLoaded: boolean;
  loading: boolean;
  outputTab: OutputTabType;
  setCurrentNote: (note: string) => void;
  setStagedNote: (note: string) => void;
  settings: MindmessSettings;
  stagedNote: string;
}

export default function OutputSection({
  currentNote,
  currentNoteLoaded,
  loading,
  outputTab,
  setCurrentNote,
  setStagedNote,
  settings,
  stagedNote,
}: OutputSectionProps) {
  // Event Handlers
  function handleKeyDown_output(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      tabInput(e.currentTarget);
    }
  }

  function handleChange_output(e: React.ChangeEvent<HTMLInputElement>) {
    if (outputTab == "current") {
      setCurrentNote(e.target.value);
    } else {
      setStagedNote(e.target.value);
    }
  }

  // Rendering
  const monospaceStyle = {
    style: {
      fontFamily: "monospace",
    },
  };

  return (
    <>
      {outputTab != "diff" && settings.outputFormat != "markdown" && (
        <NoteField
          className="limitHeightOnSmallScreen"
          disabled={loading}
          inputProps={{
            "aria-label": "Output",
            onKeyDown: handleKeyDown_output,
            spellCheck: settings.spellCheck,
            ...(settings.outputFormat == "monospace" ? monospaceStyle : {}),
          }}
          minRows={10}
          onChange={handleChange_output}
          placeholder={
            currentNoteLoaded
              ? `Write or paste your document here and use the tools on the right to work with it. 

After a command runs, verify you want to keep the change by clicking Accept.

Set your OpenAI API key in the upper-right as this app stores all data locally, and talks with OpenAI directly`
              : ""
          }
          sx={{ marginTop: 1 }}
          value={outputTab == "current" ? currentNote : stagedNote}
        />
      )}
      {outputTab != "diff" && settings.outputFormat == "markdown" && (
        <Box className="limitHeightOnSmallScreen">
          <Markdown>
            {outputTab == "current" ? currentNote : stagedNote}
          </Markdown>
        </Box>
      )}
      {outputTab == "diff" && (
        <ReactDiffViewer
          disableWordDiff={true}
          hideLineNumbers
          newValue={stagedNote}
          oldValue={currentNote}
          showDiffOnly={false}
          splitView={false}
          styles={{
            contentText: {
              fontSize: 12,
            },
          }}
          useDarkTheme={true}
        />
      )}
    </>
  );
}
