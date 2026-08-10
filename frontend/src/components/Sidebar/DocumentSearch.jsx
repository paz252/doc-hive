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
      placeholder="Search documents"
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
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