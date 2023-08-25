"use client";

import {
  AppBar,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import parse from "html-react-parser";
import { micromark } from "micromark";
import { useMemo, useRef, useState } from "react";
import { processAction } from "./process-action";

export default function Home() {
  // Hooks
  const [inputNotes, setInputNotes] = useState("");
  const [aggregateNotes, setAggregateNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const inputElement = useRef<HTMLInputElement>(null);

  const aggregateNotesJsx = useMemo(
    () => parse(micromark(aggregateNotes)),
    [aggregateNotes]
  );

  // Event Handlers
  async function handleClick_submit() {
    setLoading(true);
    const response = await processAction(inputNotes, aggregateNotes);
    setLoading(false);

    if (response.error) {
      alert(response.error);
      return;
    }

    setAggregateNotes(response.newNote);
    setInputNotes("");
    inputElement.current?.focus();
  }

  // Rendering
  return (
    <>
      <AppBar sx={{ padding: 0.5 }} position="static">
        <Typography variant="h6">Mindmess</Typography>
      </AppBar>
      <Container maxWidth="lg" sx={{ marginTop: 2 }}>
        <Typography variant="body2">
          Start by adding your notes below
        </Typography>
        <TextField
          fullWidth
          id="outlined-basic"
          label="Input Notes"
          margin="normal"
          multiline
          onChange={(e) => setInputNotes(e.target.value)}
          ref={inputElement}
          value={inputNotes}
          variant="outlined"
        />
        <Button
          disabled={loading || !inputNotes}
          onClick={handleClick_submit}
          variant="outlined"
        >
          {loading ? "Working... " : "Submit"}
        </Button>
        {aggregateNotes && (
          <Paper sx={{ marginTop: 1, padding: 1 }}>
            <Typography variant="body2">{aggregateNotesJsx}</Typography>
          </Paper>
        )}
      </Container>
    </>
  );
}
