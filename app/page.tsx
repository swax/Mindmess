"use client";

import { capitalizeFirstLetter, tabInput } from "@/utils/textEditing";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import Markdown from "react-markdown";
import { useLocalStorage } from "react-use";
import AppHeader from "./components/AppHeader";
import BaseTextField from "./components/BaseTextField";
import InputSection from "./components/InputSection";

export type FocusType = "accept" | "input" | "none";
export type OutputTabType = "current" | "staging" | "diff";
export type OutputFormatType = "standard" | "monospace" | "markdown";

export default function Home() {
  // Hooks
  const [currentNote, setCurrentNote] = useLocalStorage("currentNote", "");

  const [input, setInput] = useState("");
  const [stagedNote, setStagedNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<FocusType | null>("input");
  const [outputTab, setOutputTab] = useState<OutputTabType>("current");
  const [outputFormat, setOutputFormat] =
    useState<OutputFormatType>("standard");

  const [configMenuAnchorEl, setConfigMenuAnchorEl] =
    useState<HTMLButtonElement>();
  const configMenuOpen = Boolean(configMenuAnchorEl);

  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focus === "accept") {
      acceptButtonRef.current?.focus();
      setFocus(null);
    }
  }, [focus]);

  useEffect(() => {
    document.title = "Mindmess";
    document.title += loading ? " (Working...)" : "";
  }, [loading]);

  // Event Handlers
  function handleKeyDown_output(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      tabInput(e.currentTarget);
    }
  }

  function handleClick_accept() {
    const acceptedNote = stagedNote.replace(/\*\*/g, ""); // ** denotes changes
    setCurrentNote(acceptedNote);
    setStagedNote("");
    setInput("");
    setFocus("input");
    setOutputTab("current");
  }

  function handleClick_reject() {
    setStagedNote("");
    setFocus("input");
    setOutputTab("current");
  }

  // Rendering
  return (
    <>
      <AppHeader />
      {loading && <LinearProgress />}
      <Grid container>
        <Grid item sx={{ padding: 1 }} xs={7}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Tabs onChange={(e, v) => setOutputTab(v)} value={outputTab}>
              <Tab label="Current Note" value="current" />
              {stagedNote && <Tab label="Staging" value="staging" />}
              {stagedNote && <Tab label="Diff" value="diff" />}
            </Tabs>
            {/* Config Menu */}
            <IconButton
              aria-label="Output Config"
              onClick={(e) => setConfigMenuAnchorEl(e.currentTarget)}
              size="small"
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              anchorEl={configMenuAnchorEl}
              onClose={() => setConfigMenuAnchorEl(undefined)}
              open={configMenuOpen}
            >
              <Box
                sx={{ color: "text.secondary", fontSize: 12, marginLeft: 2 }}
              >
                View
              </Box>
              {(
                ["standard", "monospace", "markdown"] as OutputFormatType[]
              ).map((format) => (
                <MenuItem
                  key={format}
                  onClick={() => {
                    setOutputFormat(format);
                    setConfigMenuAnchorEl(undefined);
                  }}
                >
                  <Box
                    sx={{
                      color: outputFormat == format ? undefined : "transparent",
                    }}
                  >
                    ✔&nbsp;
                  </Box>{" "}
                  {capitalizeFirstLetter(format)}
                  {format == "markdown" && (
                    <Chip
                      label="Not Editable"
                      size="small"
                      sx={{ marginLeft: 1 }}
                    />
                  )}
                </MenuItem>
              ))}
            </Menu>
            <Box sx={{ flexGrow: 1 }} />
            {/* Accept/Reject Toolbar */}
            {stagedNote && (
              <>
                <Stack direction="row" spacing={1}>
                  <Button
                    color="success"
                    onClick={handleClick_accept}
                    ref={acceptButtonRef}
                    variant="outlined"
                  >
                    Accept
                  </Button>
                  <Button
                    color="error"
                    onClick={handleClick_reject}
                    variant="outlined"
                  >
                    Reject
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
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
              onChange={(e) =>
                (outputTab == "current" ? setCurrentNote : setStagedNote)(
                  e.target.value,
                )
              }
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
            <Markdown>
              {outputTab == "current" ? currentNote : stagedNote}
            </Markdown>
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
        </Grid>
        <Grid item sx={{ padding: 1 }} xs={5}>
          <InputSection
            currentNote={currentNote}
            focus={focus}
            input={input}
            loading={loading}
            setFocus={setFocus}
            setInput={setInput}
            setLoading={setLoading}
            setOutputTab={setOutputTab}
            setStagedNote={setStagedNote}
            stagedNote={stagedNote}
          />
        </Grid>
      </Grid>
    </>
  );
}
