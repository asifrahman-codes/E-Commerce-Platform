import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import PageMetadata from "./components/common/PageMetadata";

function App() {
  return (
    <BrowserRouter>
      <PageMetadata />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;