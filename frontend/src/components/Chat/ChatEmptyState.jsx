import {
  Box,
  Card,
  CardActionArea,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";

const suggestions = [
  {
    title: "Summarize",
    description:
      "Summarize the key points from these documents",
    prompt:
      "Summarize the key points from these documents.",
    icon: SummarizeOutlinedIcon,
  },
  {
    title: "Key Points",
    description:
      "What are the most important points?",
    prompt:
      "What are the most important points from these documents?",
    icon: KeyOutlinedIcon,
  },
  {
    title: "Find Information",
    description:
      "Find important information in the documents",
    prompt:
      "Find the most important information in these documents.",
    icon: SearchOutlinedIcon,
  },
  {
    title: "Compare",
    description:
      "Compare the selected documents",
    prompt:
      "Compare the selected documents and highlight the key differences.",
    icon: CompareArrowsOutlinedIcon,
  },
];

export default function ChatEmptyState({
  onPrompt,
}) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 5,
      }}
    >
      <Stack
        spacing={4}
        sx={{
          width: "100%",
          maxWidth: 760,
          textAlign: "center",
        }}
      >
        <Stack
          alignItems="center"
          spacing={1.5}
        >
          <AutoAwesomeIcon
            sx={{
              fontSize: 44,
              color: "primary.main",
            }}
          />

          <Typography
            variant="h3"
            fontWeight={700}
          >
            DOCHIVE
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            fontWeight={400}
          >
            AI Document Assistant
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 560,
            }}
          >
            Ask questions, summarize content, find
            information, and compare your documents
            using AI-powered retrieval.
          </Typography>
        </Stack>

        <Grid
          container
          spacing={2}
          justifyContent="center"
        >
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;

            return (
              <Grid
                key={suggestion.title}
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    textAlign: "left",
                    transition:
                      "border-color 0.2s, transform 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() =>
                      onPrompt(suggestion.prompt)
                    }
                    sx={{
                      height: "100%",
                      p: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                    >
                      <Icon
                        color="primary"
                        sx={{
                          mt: 0.25,
                        }}
                      />

                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                        >
                          {suggestion.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {suggestion.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Stack>
    </Box>
  );
}