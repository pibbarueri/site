import { Fragment } from "react";
import { textLink } from "@/components/ui";

const LINK_PATTERN = /(https?:\/\/[^\s<>"']+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;
// A sentence usually ends right after a link: "...escreva para marcio@igreja.org."
const TRAILING_PUNCTUATION = /[.,;:!?)]+$/;

// Plain text from a Google file, with emails and web addresses turned into links. The text is
// split into React nodes, never injected as HTML, and only http and https addresses match, so
// "javascript:" and similar stay inert text.
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(LINK_PATTERN).map((part, i) => {
        // split() with a capture group puts the matches at the odd positions.
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        const trailing = TRAILING_PUNCTUATION.exec(part)?.[0] ?? "";
        const link = trailing ? part.slice(0, -trailing.length) : part;
        const isEmail = !link.startsWith("http");
        return (
          <Fragment key={i}>
            <a
              href={isEmail ? `mailto:${link}` : link}
              {...(isEmail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              className={textLink}
            >
              {link}
            </a>
            {trailing}
          </Fragment>
        );
      })}
    </>
  );
}
