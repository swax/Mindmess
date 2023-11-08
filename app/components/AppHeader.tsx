import { localStorageApiKeyKey } from "@/utils/apiKey";
import useLocalStorageSsr from "@/utils/useLocalStorageSsr";
import GitHubIcon from "@mui/icons-material/GitHub";
import KeyIcon from "@mui/icons-material/Key";
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

export default function AppHeader() {
  // Hooks
  const [apiKey, setApiKey, apiKeyLoaded] = useLocalStorageSsr(
    localStorageApiKeyKey,
    "",
  );
  const [newApiKey, setNewApiKey] = useState<string>("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();

  const newKeyInputRef = useRef<HTMLInputElement>(null);

  // Event Handlers
  function handleClick_openMenu(e: React.MouseEvent<HTMLElement>) {
    setMenuAnchorEl(e.currentTarget);
    setNewApiKey("");

    setTimeout(() => {
      newKeyInputRef.current?.focus();
    }, 100);
  }

  function handleClose_menu() {
    setMenuAnchorEl(undefined);
  }

  function handleKeyDown_textField(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key == "Enter") {
      handleClick_setApiKey();
      e.preventDefault(); // prevents re-opening the menu
    }
  }

  function handleClick_setApiKey() {
    setApiKey(newApiKey);
    setNewApiKey("");
    handleClose_menu();
  }

  function handleClick_clearApiKey() {
    setApiKey("");
    setNewApiKey("");
    handleClose_menu();
  }

  // Rendering
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
        <div>
          {apiKeyLoaded &&
            (apiKey ? (
              <IconButton onClick={handleClick_openMenu}>
                <KeyIcon />
              </IconButton>
            ) : (
              <Button
                color="warning"
                onClick={handleClick_openMenu}
                size="small"
                variant="outlined"
              >
                Set API Key
              </Button>
            ))}
          <Popover
            anchorEl={menuAnchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            onClose={handleClose_menu}
            open={Boolean(menuAnchorEl)}
          >
            <Stack>
              <Typography sx={{ color: "lightgrey", fontSize: 15, padding: 1 }}>
                Get your API key{" "}
                <a
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                >
                  here
                </a>
              </Typography>

              {!apiKey && (
                <TextField
                  autoComplete="off"
                  fullWidth
                  inputRef={newKeyInputRef}
                  label="OpenAI API Key"
                  onChange={(e) => setNewApiKey(e.target.value)}
                  onKeyDown={handleKeyDown_textField}
                  size="small"
                  sx={{ margin: 1, marginTop: 1, paddingRight: 2 }}
                  value={newApiKey}
                  variant="outlined"
                />
              )}

              <Stack
                alignItems="center"
                direction="row"
                paddingRight={1}
                spacing={1}
              >
                {apiKey ? (
                  <>
                    <Box sx={{ flexGrow: 1, paddingLeft: 1 }}>
                      {`Key: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`}
                    </Box>
                    <Button
                      color="inherit"
                      onClick={handleClick_clearApiKey}
                      variant="outlined"
                    >
                      Clear
                    </Button>
                  </>
                ) : (
                  <>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                      color="success"
                      onClick={handleClick_setApiKey}
                      variant="outlined"
                    >
                      Set
                    </Button>
                  </>
                )}
              </Stack>

              <Typography sx={{ color: "lightgrey", fontSize: 13, padding: 1 }}>
                Key stored in local storage. <br />
                Requests to OpenAI are made from your local. <br />
                Build from{" "}
                <a href="https://github.com/swax/mindmess" target="_blank">
                  Github
                </a>{" "}
                to self-host.
              </Typography>
            </Stack>
          </Popover>
        </div>
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
