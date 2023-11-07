import { capitalizeFirstLetter } from "@/utils/textEditing";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  FocusType,
  MindmessSettings,
  OutputFormatType,
  OutputTabType,
} from "../page";

interface OutputToolbarProps {
  focus: FocusType | null;
  handleClick_accept: () => void;
  handleClick_reject: () => void;
  outputTab: OutputTabType;
  setFocus: (focus: FocusType | null) => void;
  setOutputTab: (tab: OutputTabType) => void;
  setSettings: (format: MindmessSettings) => void;
  settings: MindmessSettings;
  stagedNote?: string;
}

export default function OutputToolbar({
  focus,
  handleClick_accept,
  handleClick_reject,
  outputTab,
  setFocus,
  setOutputTab,
  setSettings,
  settings,
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

  // Event Handlers
  function handleClick_outputFormat(format: OutputFormatType) {
    setSettings({ ...settings, outputFormat: format });
    setConfigMenuAnchorEl(undefined);
  }

  function handleClick_spellCheck() {
    setSettings({ ...settings, spellCheck: !settings.spellCheck });
    setConfigMenuAnchorEl(undefined);
  }

  // Rendering
  return (
    <>
      {/* Accept/Reject Toolbar, float here so they stay over the tabs on small screen sizes */}
      {stagedNote && (
        <Box sx={{ float: "right", marginTop: 1.5 }}>
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
        </Box>
      )}
      {/* Output Tabs */}
      <Box sx={{ display: "flex", float: "left" }}>
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
                onClick={() => handleClick_outputFormat(format)}
              >
                <Box
                  sx={{
                    color:
                      settings.outputFormat == format
                        ? undefined
                        : "transparent",
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
          <Divider />
          <MenuItem onClick={handleClick_spellCheck}>
            <Box sx={{ marginLeft: 2 }}>Spell Check</Box>
            <Chip
              label={settings.spellCheck ? "On" : "Off"}
              size="small"
              sx={{ marginLeft: 1 }}
            />
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
}
