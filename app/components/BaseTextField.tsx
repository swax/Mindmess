import { TextField, TextFieldProps } from "@mui/material";

export default function BaseTextField(props: TextFieldProps) {
  return (
    <TextField
      fullWidth
      margin="normal"
      multiline
      size="small"
      variant="outlined"
      {...props}
      inputProps={{
        ...props.inputProps,
        style: {
          fontFamily: "Calibri",
          fontSize: 14,
          lineHeight: 1.3,
          ...props.inputProps?.style,
        },
      }}
      sx={{ backgroundColor: "white", ...props.sx }}
    />
  );
}
