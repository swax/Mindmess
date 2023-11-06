import { clearApiKey, getApiKey, saveApiKey } from "@/utils/apiKey";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  AppBar,
  Box,
  Button,
  IconButton,
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
    setLocalApiKey("");
  }

  // Rendering
  const currentApiKey = pageLoaded ? getApiKey() : "";

  return (
    <AppBar position="static" sx={{ padding: 0.5 }}>
      <Toolbar disableGutters sx={{ gap: 1 }} variant="dense">
        <Typography
          fontFamily="cursive"
          sx={{ flexGrow: 1, marginLeft: 1 }}
          title="Your mind is a mess."
          variant="h6"
        >
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
                <Typography
                  sx={{ color: "lightgrey", fontSize: 15, padding: 1 }}
                >
                  Get your API key{" "}
                  <a
                    href="https://platform.openai.com/account/api-keys"
                    target="_blank"
                  >
                    here
                  </a>
                </Typography>

                {!currentApiKey && (
                  <TextField
                    autoComplete="off"
                    fullWidth
                    inputRef={apiKeyInputRef}
                    label="OpenAI API Key"
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    onKeyDown={handleKeyDown_textField}
                    size="small"
                    sx={{ margin: 1, marginTop: 1, paddingRight: 2 }}
                    value={localApiKey}
                    variant="outlined"
                  />
                )}

                <Stack
                  alignItems="center"
                  direction="row"
                  paddingRight={1}
                  spacing={1}
                >
                  <Box sx={{ flexGrow: 1 }} />
                  {currentApiKey ? (
                    <Box paddingRight={1} textAlign="right">
                      {currentApiKey.slice(0, 4) +
                        "..." +
                        currentApiKey.slice(-4)}
                    </Box>
                  ) : (
                    <Button
                      color="success"
                      onClick={handleClick_setApiKey}
                      variant="outlined"
                    >
                      Set
                    </Button>
                  )}
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
        <IconButton
          aria-label="Github"
          href="https://github.com/swax/mindmess"
          target="_blank"
        >
          <GitHubIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
