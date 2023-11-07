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

export interface MindmessSettings {
  outputFormat: OutputFormatType;
  spellCheck: boolean;
}

export default function Home() {
  // Hooks
  const [currentNote, setCurrentNote, currentNoteLoaded] =
    useLocalStorageSsr<string>("currentNote", "");
  const [stagedNote, setStagedNote] = useState("");

  const [focus, setFocus] = useState<FocusType | null>("input");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [outputTab, setOutputTab] = useState<OutputTabType>("current");

  const [settings, setSettings] = useLocalStorageSsr<MindmessSettings>(
    "settings",
    {
      outputFormat: "standard",
      spellCheck: false,
    }
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
      <Grid container padding={1} spacing={2}>
        <Grid item md={7} sm={12} xs={12}>
          <OutputToolbar
            {...{
              focus,
              handleClick_accept,
              handleClick_reject,
              outputTab,
              setFocus,
              setOutputTab,
              setSettings,
              settings,
              stagedNote,
            }}
          />
          <OutputSection
            {...{
              currentNote,
              currentNoteLoaded,
              loading,
              outputTab,
              setCurrentNote,
              setStagedNote,
              settings,
              stagedNote,
            }}
          />
        </Grid>
        <Grid item md={5} sm={12} xs={12}>
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
