import gptModels, { GptModelName } from "@/utils/gptModels";
import useLocalStorageSsr from "@/utils/useLocalStorageSsr";
import { Tab, Tabs } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { FocusType, OutputTabType } from "../page";
import CommandPanel from "./CommandPanel";
import MergePanel from "./MergePanel";
import ModelSelection from "./ModelSelection";
import ParrotCheckPanel from "./ParrotCheckPanel";
import QuestionPanel from "./QuestionPanel";

type InputTabType = "merge" | "command" | "question" | "parrotCheck";

interface InputSectionProps {
  currentNote?: string;
  input: string;
  focus: FocusType | null;
  loading: boolean;
  setFocus: (focus: FocusType | null) => void;
  setInput: (input: string) => void;
  setLoading: (loading: boolean) => void;
  setStagedNote: (note: string) => void;
  setOutputTab: (tab: OutputTabType) => void;
  stagedNote: string;
}

export default function InputSection({
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
}: InputSectionProps) {
  // Hooks
  const [inputTab, setInputTab] = useLocalStorageSsr<InputTabType>(
    "inputTab",
    "merge",
  );

  const [gptModelName, setGptModelName, gptModelLoaded] =
    useLocalStorageSsr<GptModelName>("gptModel", "gpt-5");

  const [usageReport, setUsageReport] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focus === "input") {
      inputRef.current?.focus();
      setFocus(null);
    }
  }, [focus]);

  // Event Handlers
  function updateUsageReport(inputTokens: number, outputTokens: number) {
    const gptModel = gptModels.find((model) => model.name == gptModelName);
    if (!gptModel) return;

    let cost =
      (inputTokens * gptModel.costPer1MInput) / 1_000_000 +
      (outputTokens * gptModel.costPer1MOutput) / 1_000_000;
    setUsageReport(
      `Last Run: Input ${inputTokens} tokens, output ${outputTokens} tokens. Cost $${cost.toFixed(4)}`,
    );
    setTotalCost(totalCost + cost);
  }

  function handleChange_inputTab(
    e: React.ChangeEvent<{}>,
    value: InputTabType,
  ) {
    setInputTab(value);
    setFocus("input");
  }

  // Rendering
  return (
    <>
      <Tabs onChange={handleChange_inputTab} value={inputTab}>
        <Tab label="Merge" value="merge" />
        <Tab label="Command" value="command" />
        <Tab label="Question" value="question" />
        <Tab label="Parrot Check" value="parrotCheck" />
      </Tabs>
      {inputTab === "merge" && (
        <MergePanel
          input={input}
          currentNote={currentNote}
          gptModelName={gptModelName}
          stagedNote={stagedNote}
          loading={loading}
          inputRef={inputRef}
          setInput={setInput}
          setFocus={setFocus}
          setLoading={setLoading}
          setStagedNote={setStagedNote}
          setOutputTab={setOutputTab}
          updateUsageReport={updateUsageReport}
        />
      )}
      {inputTab === "command" && (
        <CommandPanel
          input={input}
          currentNote={currentNote}
          gptModelName={gptModelName}
          stagedNote={stagedNote}
          loading={loading}
          inputRef={inputRef}
          setInput={setInput}
          setFocus={setFocus}
          setLoading={setLoading}
          setStagedNote={setStagedNote}
          setOutputTab={setOutputTab}
          updateUsageReport={updateUsageReport}
        />
      )}
      {inputTab === "question" && (
        <QuestionPanel
          input={input}
          currentNote={currentNote}
          gptModelName={gptModelName}
          loading={loading}
          inputRef={inputRef}
          setInput={setInput}
          setFocus={setFocus}
          setLoading={setLoading}
          updateUsageReport={updateUsageReport}
        />
      )}
      {inputTab === "parrotCheck" && (
        <ParrotCheckPanel
          input={input}
          currentNote={currentNote}
          gptModelName={gptModelName}
          stagedNote={stagedNote}
          loading={loading}
          inputRef={inputRef}
          setInput={setInput}
          setFocus={setFocus}
          setLoading={setLoading}
          updateUsageReport={updateUsageReport}
        />
      )}
      {gptModelLoaded && inputTab !== "parrotCheck" && (
        <ModelSelection
          {...{ gptModelName, setGptModelName, totalCost, usageReport }}
        />
      )}
    </>
  );
}
