import SearchIcon from "@mui/icons-material/Search";

import {
  InputAdornment,
  TextField,
} from "@mui/material";

export default function DocumentSearch({
  value,
  onChange,
}) {
  return (
    <TextField
      fullWidth
      size="small"
      placeholder="Filter files"
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      sx={(theme) => ({
        "& .MuiOutlinedInput-root": {
          backgroundColor: theme.palette.surface.chatWindow,
        }
      })}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}