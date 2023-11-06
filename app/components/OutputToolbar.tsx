import { capitalizeFirstLetter } from "@/utils/textEditing";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { FocusType, OutputFormatType, OutputTabType } from "../page";

interface OutputToolbarProps {
  focus: FocusType | null;
  handleClick_accept: () => void;
  handleClick_reject: () => void;
  outputFormat?: OutputFormatType;
  outputTab: OutputTabType;
  setFocus: (focus: FocusType | null) => void;
  setOutputFormat: (format: OutputFormatType) => void;
  setOutputTab: (tab: OutputTabType) => void;
  stagedNote?: string;
}

export default function OutputToolbar({
  focus,
  handleClick_accept,
  handleClick_reject,
  outputFormat,
  outputTab,
  setFocus,
  setOutputFormat,
  setOutputTab,
  stagedNote,
}: OutputToolbarProps) {
  // Hooks
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

  // Rendering
  return (
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
        <Box sx={{ color: "text.secondary", fontSize: 12, marginLeft: 2 }}>
          View
        </Box>
        {(["standard", "monospace", "markdown"] as OutputFormatType[]).map(
          (format) => (
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
          ),
        )}
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
  );
}
