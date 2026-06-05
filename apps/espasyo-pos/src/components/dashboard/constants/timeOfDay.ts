import { WbSunny, CloudQueue, NightsStay } from "@mui/icons-material";

export const TIME_OF_DAY = {
  morning: {
    icon: WbSunny,
    message: "Rise and shine! Ready to rock this morning shift?",
    gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  },
  afternoon: {
    icon: CloudQueue,
    message: "Afternoon energy! Keep that momentum going!",
    gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  },
  evening: {
    icon: NightsStay,
    message: "Evening magic! Finish the day strong!",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
} as const;
