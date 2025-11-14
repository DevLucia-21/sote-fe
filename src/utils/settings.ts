export const isDailyQuestionEnabled = () => {
  return localStorage.getItem("dailyQuestionEnabled") !== "false";
};
