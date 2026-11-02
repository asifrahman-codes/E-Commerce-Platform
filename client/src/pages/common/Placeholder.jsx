import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Placeholder = ({ title, description }) => {
  return (
    <section className="container-custom flex min-h-[450px] flex-col items-center justify-center text-center">

      <h1 className="text-3xl font-bold text-gray-900">
        {title}
      </h1>

      <p className="mt-3 text-gray-500">
        {description || "This module will be implemented in an upcoming phase."}
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
      >
        <ArrowLeft size={17} />
        Back to Home
      </Link>

    </section>
  );
};

export default Placeholder;