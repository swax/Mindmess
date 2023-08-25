"use client";

import {
  AppBar,
  Button,
  ClickAwayListener,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import parse from "html-react-parser";
import { micromark } from "micromark";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { processAction } from "./process-action";

export default function Home() {
  // Hooks
  const [inputNote, setInputNote] = useState("");
  const [currentNote, setCurrentNote] = useState("");
  const [stagedNote, setStagedNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<"accept" | "input" | "none" | "output">(
    "input"
  );
  const [editOuput, setEditOutput] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLInputElement>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  const currentNoteJsx = useMemo(
    () => parse(micromark(currentNote)),
    [currentNote]
  );

  useEffect(() => {
    if (focus === "input") {
      inputRef.current?.focus();
    } else if (focus === "output") {
      outputRef.current?.focus();
    } else if (focus === "accept") {
      acceptButtonRef.current?.focus();
    }
  }, [focus]);

  // Event Handlers
  function handleKeyDown_input(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleClick_submit();
    }
  }

  async function handleClick_submit() {
    setLoading(true);
    setFocus("none");
    const response = await processAction(inputNote, currentNote);
    setLoading(false);

    if (response.error) {
      alert(response.error);
      return;
    }

    if (response.newNote === currentNote || !currentNote) {
      setCurrentNote(response.newNote);
      setInputNote("");
      setFocus("input");
    } else {
      setStagedNote(response.newNote);
      setFocus("accept");
    }
  }

  function handleClick_accept() {
    setCurrentNote(stagedNote);
    setStagedNote("");
    setInputNote("");
    setFocus("input");
  }

  function handleClick_reject() {
    setStagedNote("");
    setFocus("input");
  }

  function handleClick_currentNote() {
    setEditOutput(true);
    setFocus("output");
  }

  // Rendering
  return (
    <>
      <AppBar sx={{ padding: 0.5 }} position="static">
        <Typography variant="h6">Mindmess</Typography>
      </AppBar>
      <Grid container sx={{ marginTop: 2 }}>
        <Grid item sx={{ padding: 1 }} xs={5}>
          {/* Input Section */}
          <Typography variant="body2">Input:</Typography>
          <TextField
            disabled={loading || Boolean(stagedNote)}
            fullWidth
            id="input-textfield"
            inputRef={inputRef}
            margin="normal"
            multiline
            onChange={(e) => setInputNote(e.target.value)}
            onKeyDown={handleKeyDown_input}
            size="small"
            value={inputNote}
            variant="outlined"
          />
          <Button
            disabled={loading || !inputNote || Boolean(stagedNote)}
            onClick={handleClick_submit}
            variant="outlined"
          >
            {loading ? "Working... " : "Submit"}
          </Button>

          {/* Accept/Reject Section */}
          {stagedNote && (
            <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
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
          )}
        </Grid>
        <Grid item sx={{ padding: 1 }} xs={7}>
          {/* Output Section */}
          <Typography variant="body2">Output:</Typography>
          <Paper sx={{ marginTop: 2, minHeight: 22, padding: 1 }}>
            {stagedNote ? (
              <ReactDiffViewer
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
            ) : editOuput ? (
              <ClickAwayListener
                onClickAway={() => setEditOutput(false)}
                mouseEvent="onMouseDown"
              >
                <TextField
                  disabled={loading || Boolean(stagedNote)}
                  fullWidth
                  id="output-textfield"
                  inputRef={outputRef}
                  margin="normal"
                  multiline
                  onChange={(e) => setCurrentNote(e.target.value)}
                  size="small"
                  value={currentNote}
                  variant="outlined"
                />
              </ClickAwayListener>
            ) : (
              <Typography onClick={handleClick_currentNote} variant="body2">
                {currentNoteJsx}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
