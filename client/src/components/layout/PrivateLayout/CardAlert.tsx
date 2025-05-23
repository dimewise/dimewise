import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export const CardAlert = () => {
  return (
    <Card
      variant="outlined"
      sx={{ m: 1.5, p: 1.5 }}
    >
      <CardContent>
        <AutoAwesomeRoundedIcon fontSize="small" />
        <Typography
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Plan about to expire
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 2, color: "text.secondary" }}
        >
          Enjoy 10% off when renewing your plan today.
        </Typography>
        <Button
          variant="contained"
          size="small"
          fullWidth
        >
          Get the discount
        </Button>
      </CardContent>
    </Card>
  );
};
