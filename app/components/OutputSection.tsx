import { tabInput } from "@/utils/textEditing";
import ReactDiffViewer from "react-diff-viewer-continued";
import Markdown from "react-markdown";
import { OutputFormatType, OutputTabType } from "../page";
import BaseTextField from "./BaseTextField";

interface OutputSectionProps {
  currentNote?: string;
  loading: boolean;
  outputFormat: OutputFormatType;
  outputTab: OutputTabType;
  setCurrentNote: (note: string) => void;
  setStagedNote: (note: string) => void;
  stagedNote: string;
}

export default function OutputSection({
  currentNote,
  loading,
  outputFormat,
  outputTab,
  setCurrentNote,
  setStagedNote,
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
  return (
    <>
      {outputTab != "diff" && outputFormat != "markdown" && (
        <BaseTextField
          disabled={loading}
          inputProps={{
            "aria-label": "Output",
            onKeyDown: handleKeyDown_output,
            ...(outputFormat == "monospace"
              ? {
                  style: {
                    fontFamily: "monospace",
                  },
                }
              : {}),
          }}
          minRows={10}
          onChange={handleChange_output}
          placeholder={`This is your current note. 

Use the options on the right to merge in additional notes, transform the note with a command, or ask questions about the note. 

After a command runs, verify you want to keep the change by clicking Accept or Reject before running another command. 

Set your OpenAI API key in the upper-right. Your key is stored in local storage, not sent to any server.
API calls are made directly to OpenAI from your machine. 
You can also run the app yourself by building the code from Github.`}
          spellCheck={false}
          value={outputTab == "current" ? currentNote : stagedNote}
        />
      )}
      {outputTab != "diff" && outputFormat == "markdown" && (
        <Markdown>{outputTab == "current" ? currentNote : stagedNote}</Markdown>
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
