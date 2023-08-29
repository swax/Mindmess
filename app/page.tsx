"use client";

import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  AppBar,
  Box,
  Button,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableCell,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import OpenAI from "openai";
import { useEffect, useRef, useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { useLocalStorage } from "react-use";
import { commandAction } from "./actions/command-action";
import { mergeAction } from "./actions/merge-action";
import { questionAction } from "./actions/question-action";
import BaseTextField from "./components/BaseTextField";

export default function Home() {
  // Hooks
  const [currentNote, setCurrentNote] = useLocalStorage("currentNote", "");

  const [input, setInput] = useState("");
  const [stagedNote, setStagedNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<"accept" | "input" | "none">("input");
  const [outputTab, setOutputTab] = useState<"current" | "staging" | "diff">(
    "current"
  );
  const [inputTab, setInputTab] = useState<"merge" | "command" | "question">(
    "merge"
  );

  const [chatLog, setChatLog] = useState<
    OpenAI.Chat.Completions.ChatCompletionMessage[]
  >([]);

  const runNumber = useRef(0);
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
      <AppBar sx={{ padding: 0.5, paddingLeft: 1.5 }} position="static">
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
              {loading ? "Working... " : "Run"}
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
        </Grid>
      </Grid>
    </>
  );
}
