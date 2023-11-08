import gptModels, { GptModelName } from "@/utils/gptModels";
import { Box, Chip, Divider, Menu, MenuItem, Stack } from "@mui/material";
import { useState } from "react";

interface ModelSelectionProps {
  gptModelName: GptModelName;
  setGptModelName: (model: GptModelName) => void;
  totalCost: number;
  usageReport: string;
}
export default function ModelSelection({
  gptModelName,
  setGptModelName,
  totalCost,
  usageReport,
}: ModelSelectionProps) {
  // Hooks
  const [modelMenuAnchorEl, setModelMenuAnchorEl] = useState<HTMLDivElement>();
  const modelMenuOpen = Boolean(modelMenuAnchorEl);

  // Rendering
  const gptModelDescription =
    gptModels.find((model) => model.name == gptModelName)?.description ||
    "Unknown Model";

  return (
    <>
      <Chip
        label={"Using " + gptModelDescription}
        onClick={(e) => setModelMenuAnchorEl(e.currentTarget)}
        size="small"
        sx={{ marginTop: 2 }}
      />
      <Menu
        anchorEl={modelMenuAnchorEl}
        onClose={() => setModelMenuAnchorEl(undefined)}
        open={modelMenuOpen}
      >
        {gptModels.map((model, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              setGptModelName(model.name);
              setModelMenuAnchorEl(undefined);
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Box
                sx={{
                  color: model.name == gptModelName ? undefined : "transparent",
                }}
              >
                ✔&nbsp;
              </Box>{" "}
              <Stack>
                <Box>{model.description}</Box>
                <Box sx={{ fontSize: 12, color: "text.secondary" }}>
                  Input ${model.costPer1kInput}, Output ${model.costPer1kOutput}{" "}
                  per 1k tokens
                </Box>
              </Stack>
            </Stack>
          </MenuItem>
        ))}
        <Divider />
        <Box sx={{ color: "text.secondary", fontSize: 12, marginLeft: 2 }}>
          <a href="https://openai.com/pricing#language-models" target="_blank">
            Pricing Source
          </a>
        </Box>
      </Menu>
      {/* Usage Report */}
      {totalCost > 0 && (
        <Box sx={{ marginTop: 2 }}>
          <Box sx={{ fontSize: 12, color: "text.secondary" }}>
            {usageReport}
          </Box>
          <Box sx={{ fontSize: 12, color: "text.secondary" }}>
            Running Total Cost: ${totalCost.toFixed(4)}
          </Box>
        </Box>
      )}
    </>
  );
}
