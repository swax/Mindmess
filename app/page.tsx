"use client";

import { tabInput } from "@/utils/textEditing";
import {
  Box,
  Button,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { useLocalStorage } from "react-use";
import AppHeader from "./components/AppHeader";
import BaseTextField from "./components/BaseTextField";
import InputSection from "./components/InputSection";

export type FocusType = "accept" | "input" | "none";
export type OutputTabType = "current" | "staging" | "diff";

export default function Home() {
  // Hooks
  const [currentNote, setCurrentNote] = useLocalStorage("currentNote", "");

  const [input, setInput] = useState("");
  const [stagedNote, setStagedNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<FocusType>("input");
  const [outputTab, setOutputTab] = useState<OutputTabType>("current");

  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focus === "accept") {
      acceptButtonRef.current?.focus();
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
              minRows={10}
              onChange={(e) =>
                (outputTab == "current" ? setCurrentNote : setStagedNote)(
                  e.target.value,
                )
              }
              spellCheck={false}
              value={outputTab == "current" ? currentNote : stagedNote}
            />
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
