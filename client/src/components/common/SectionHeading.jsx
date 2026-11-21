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
          <p className="shop-eyebrow mb-2">
            {eyebrow}
          </p>
        )}

        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            {description}
          </p>
        )}
      </div>

      {link && (
        <Link
          to={link}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:gap-3"
        >
          {linkText}
          <ArrowRight size={17} />
        </Link>
      )}

    </div>
  );
};

export default SectionHeading;