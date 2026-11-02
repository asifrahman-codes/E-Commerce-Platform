export const getErrorMessage = (error) => {
  if (error?.errors) {
    if (Array.isArray(error.errors)) {
      return error.errors
        .map((item) => item.message || item.msg)
        .filter(Boolean)
        .join(", ");
    }
  }

  return (
    error?.message ||
    error?.response?.data?.message ||
    "Something went wrong. Please try again."
  );
};