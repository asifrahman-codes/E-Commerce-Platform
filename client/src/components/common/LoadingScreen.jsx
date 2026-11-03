const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">

      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

      <p className="text-sm font-medium text-gray-500">
        {message}
      </p>

    </div>
  );
};

export default LoadingScreen;