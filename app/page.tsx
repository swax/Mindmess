"use client";

import useLocalStorageSsr from "@/utils/useLocalStorageSsr";
import { Grid, LinearProgress } from "@mui/material";
import { useEffect, useState } from "react";
import AppHeader from "./components/AppHeader";
import InputSection from "./components/InputSection";
import OutputSection from "./components/OutputSection";
import OutputToolbar from "./components/OutputToolbar";

export type FocusType = "accept" | "input" | "none";
export type OutputTabType = "current" | "staging" | "diff";
export type OutputFormatType = "standard" | "monospace" | "markdown";

export default function Home() {
  // Hooks
  const [currentNote, setCurrentNote, currentNoteLoaded] =
    useLocalStorageSsr<string>("currentNote", "");
  const [stagedNote, setStagedNote] = useState("");

  const [focus, setFocus] = useState<FocusType | null>("input");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [outputTab, setOutputTab] = useState<OutputTabType>("current");
  const [outputFormat, setOutputFormat] = useLocalStorageSsr<OutputFormatType>(
    "outputFormat",
    "standard",
  );

  useEffect(() => {
    document.title = "Mindmess";
    document.title += loading ? " (Working...)" : "";
  }, [loading]);

  // Event Handlers
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
          <OutputToolbar
            {...{
              focus,
              handleClick_accept,
              handleClick_reject,
              outputFormat,
              outputTab,
              setFocus,
              setOutputFormat,
              setOutputTab,
              stagedNote,
            }}
          />
          <OutputSection
            {...{
              currentNote,
              currentNoteLoaded,
              loading,
              outputFormat,
              outputTab,
              setCurrentNote,
              setStagedNote,
              stagedNote,
            }}
          />
        </Grid>
        <Grid item sx={{ padding: 1 }} xs={5}>
          <InputSection
            {...{
              currentNote,
              focus,
              input,
              loading,
              setFocus,
              setInput,
              setLoading,
              setStagedNote,
              setOutputTab,
              stagedNote,
            }}
          />
        </Grid>
      </Grid>
    </>
  );
}
