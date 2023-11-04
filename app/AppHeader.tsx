import { clearApiKey, getApiKey, saveApiKey } from "@/utils/apiKey";
import {
  AppBar,
  Box,
  Button,
  Popover,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { useEffectOnce } from "react-use";

export default function AppHeader() {
  // Hooks
  const [pageLoaded, setPageLoaded] = useState(false);
  const [localApiKey, setLocalApiKey] = useState<string>("");
  const [editKeyAnchorEl, setEditKeyAnchorEl] = useState<HTMLElement>();

  const apiKeyInputRef = useRef<HTMLInputElement>(null);

  useEffectOnce(() => {
    // Need to wait until client is loaded to query local storage for the api key
    setPageLoaded(true);
    setLocalApiKey(getApiKey());
  });

  // Event Handlers
  function handleClick_openMenu(e: React.MouseEvent<HTMLElement>) {
    setEditKeyAnchorEl(e.currentTarget);
    setLocalApiKey(getApiKey());

    setTimeout(() => {
      apiKeyInputRef.current?.focus();
    }, 100);
  }

  function handleClose_menu() {
    setEditKeyAnchorEl(undefined);
  }

  function handleKeyDown_textField(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key == "Enter") {
      handleClick_setApiKey();
      e.preventDefault(); // prevents re-opening the menu
    }
  }

  function handleClick_setApiKey() {
    saveApiKey(localApiKey);
    handleClose_menu();
  }

  function handleClick_clearApiKey() {
    clearApiKey();
    handleClose_menu();
  }

  // Rendering
  const currentApiKey = pageLoaded ? getApiKey() : "";

  return (
    <AppBar sx={{ padding: 0.5, paddingLeft: 1.5 }} position="static">
      <Toolbar variant="dense">
        <Typography fontFamily="cursive" variant="h6" sx={{ flexGrow: 1 }}>
          Mindmess
        </Typography>
        {pageLoaded && (
          <div>
            <Button
              color={currentApiKey ? "inherit" : "warning"}
              onClick={handleClick_openMenu}
              size="small"
              variant="outlined"
            >
              {!currentApiKey ? "Set" : ""} OpenAI API Key
            </Button>
            <Popover
              anchorEl={editKeyAnchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              onClose={handleClose_menu}
              open={Boolean(editKeyAnchorEl)}
            >
              <Stack>
                <TextField
                  autoComplete="off"
                  fullWidth
                  label="OpenAI API Key"
                  onKeyDown={handleKeyDown_textField}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  size="small"
                  sx={{ margin: 1, marginTop: 2, paddingRight: 2 }}
                  value={localApiKey}
                  variant="outlined"
                  inputRef={apiKeyInputRef}
                />
                <Stack direction="row" paddingRight={1} spacing={1}>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button
                    color="success"
                    onClick={handleClick_setApiKey}
                    variant="outlined"
                  >
                    Set
                  </Button>
                  <Button
                    color="inherit"
                    onClick={handleClick_clearApiKey}
                    variant="outlined"
                  >
                    Clear
                  </Button>
                </Stack>
                <Typography
                  sx={{ color: "lightgrey", fontSize: 13, padding: 1 }}
                >
                  Key stored in local storage. <br />
                  Requests to OpenAI are made from your local. <br />
                  Build from{" "}
                  <a href="https://github.com/swax/mindmess" target="_blank">
                    Github
                  </a>{" "}
                  to run site locally.
                </Typography>
              </Stack>
            </Popover>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}
