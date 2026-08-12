import {
  Box,
  Card,
  CardActionArea,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

const suggestions = [
  {
    title: "Summarize",
    description:
      "Summarize key points from these documents",
    prompt:
      "Summarize the key points from these documents.",
    icon: SummarizeOutlinedIcon,
  },
  {
    title: "Interview / Q&A Insights",
    description:
      "Extract important questions and their answers.",
    prompt:
      "What are the most critical questions and answers covered in this text?",
    icon: QuestionAnswerOutlinedIcon,
  },
  {
    title: "Ask About the Documents",
    description:
      "Answer specific questions from the documents.",
    prompt:
      "What are the main topics discussed in these documents?",
    icon: FindInPageOutlinedIcon,
  },
  {
    title: "Technical Concepts",
    description:
      "Explain key technial concepts in the document.",
    prompt:
      "Explain main technical concepts and architecture described in the document",
    icon: AccountTreeOutlinedIcon,
  },
];

export default function ChatEmptyState({
  onPrompt,
}) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        px: 3,
        py: 5,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 760,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              borderRadius: 1,
              mb: 2
            }}
          >
            <MenuBookOutlinedIcon sx={{ fontSize: 30 }} />
          </Box>

          <Typography variant="h5" sx={{ lineHeight: 1.2, letterSpacing: 1.2 }}>
            Doc
            <Box component="span" sx={{ color: "primary.main" }}>
              Hive
            </Box>
            {" "}AI Document Assistant
          </Typography>

          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={(theme) => ({
              lineHeight: 1.2,
              maxWidth: 650,
              color: theme.palette.text.secondary
            })}
          >
            Drop in your PDFs, Word files, or notes and let DocHive
            find the answers you need.
          </Typography>
        </Box>

        {/* Suggestions */}
        <Grid
          container
          spacing={1}
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
                          variant="subtitle2"
                          sx={(theme) => ({
                            color: theme.palette.text.secondary,
                            fontSize: 14
                          })}
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
      </Box>
    </Box>
  );
}