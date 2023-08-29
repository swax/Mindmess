"use client";

import {
  AppBar,
  Box,
  Button,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { useLocalStorage } from "react-use";
import { mergeAction } from "./actions/merge-action";
import BaseTextField from "./components/BaseTextField";
import { commandAction } from "./actions/command-action";

export default function Home() {
  // Hooks
  const [inputNote, setInputNote] = useState("");
  const [currentNote, setCurrentNote] = useLocalStorage("currentNote", "");
  const [stagedNote, setStagedNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<"accept" | "input" | "none">("input");
  const [outputTab, setOutputTab] = useState<"current" | "staging" | "diff">(
    "current"
  );
  const [inputTab, setInputTab] = useState<"merge" | "command" | "question">(
    "merge"
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focus === "input") {
      inputRef.current?.focus();
    } else if (focus === "accept") {
      acceptButtonRef.current?.focus();
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

  function handleKeyDown_output(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      tabInput(e.currentTarget);
    }
  }

  function tabInput(input: HTMLInputElement) {
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    // unfortunately breaks undo
    input.value =
      input.value.substring(0, start) + "\t" + input.value.substring(end);

    input.selectionStart = input.selectionEnd = start + 1;
  }

  async function handleClick_runInput() {
    setLoading(true);
    setFocus("none");

    const response =
      inputTab == "merge"
        ? await mergeAction(inputNote, currentNote || "")
        : inputTab == "command"
        ? await commandAction(inputNote, currentNote || "")
        : { newNote: "", error: "Invalid tab selected" };

    setLoading(false);

    if (response.error) {
      alert(response.error);
      return;
    }

    setStagedNote(response.newNote);
    setFocus("accept");
    setOutputTab("staging");
  }

  function handleClick_accept() {
    const acceptedNote = stagedNote.replace(/\*\*/g, ""); // ** denotes changes
    setCurrentNote(acceptedNote);
    setStagedNote("");
    setInputNote("");
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
      <AppBar sx={{ padding: 0.5 }} position="static">
        <Typography variant="h6">Mindmess</Typography>
      </AppBar>
      {loading && <LinearProgress />}
      <Grid container>
        <Grid item sx={{ padding: 1 }} xs={7}>
          {/* Output Section */}
          <Stack direction="row" spacing={1}>
            <Tabs value={outputTab} onChange={(e, v) => setOutputTab(v)}>
              <Tab value="current" label="Current Note" />
              {stagedNote && <Tab value="staging" label="Staging" />}
              {stagedNote && <Tab value="diff" label="Diff" />}
            </Tabs>
            <Box sx={{ flexGrow: 1 }} />
            {/* Accept/Reject Section */}
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
          {outputTab != "diff" && (
            <BaseTextField
              disabled={loading}
              inputProps={{
                onKeyDown: handleKeyDown_output,
              }}
              onChange={(e) =>
                (outputTab == "current" ? setCurrentNote : setStagedNote)(
                  e.target.value
                )
              }
              value={outputTab == "current" ? currentNote : stagedNote}
            />
          )}
          {outputTab == "diff" && (
            <ReactDiffViewer
              disableWordDiff={true}
              showDiffOnly={false}
              hideLineNumbers
              newValue={stagedNote}
              oldValue={currentNote}
              splitView={false}
              styles={{
                contentText: {
                  fontSize: 12,
                },
              }}
            />
          )}
        </Grid>
        <Grid item sx={{ padding: 1 }} xs={5}>
          {/* Input Section */}
          <Tabs value={inputTab} onChange={(e, v) => setInputTab(v)}>
            <Tab value="merge" label="Merge" />
            <Tab value="command" label="Command" />
            <Tab value="question" label="Question" />
          </Tabs>
          <BaseTextField
            disabled={loading || Boolean(stagedNote)}
            inputProps={{
              onKeyDown: handleKeyDown_input,
            }}
            inputRef={inputRef}
            minRows={3}
            onChange={(e) => setInputNote(e.target.value)}
            value={inputNote}
          />
          <Button
            disabled={loading || !inputNote || Boolean(stagedNote)}
            onClick={handleClick_runInput}
            variant="outlined"
          >
            {loading ? "Working... " : "Run"}
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

