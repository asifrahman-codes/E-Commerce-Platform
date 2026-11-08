import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SectionHeading = ({
  eyebrow,
  title,
  description,
  link,
  linkText = "View All",
}) => {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">

      <div>
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            {eyebrow}
          </p>
        )}

        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {link && (
        <Link
          to={link}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          {linkText}
          <ArrowRight size={17} />
        </Link>
      )}

    </div>
  );
};

export default SectionHeading;