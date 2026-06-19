

function sectionToHtml(title: string, text: string): string {
  const cleanText = text || "";
  const lines = cleanText.split("\n").map(l => l.trim()).filter(Boolean);
  let contentHtml = "";
  let inList = false;
  let listType: "ul" | "ol" | null = null;

  lines.forEach((line) => {
    const isOrdered = /^\d+\.\s+/.test(line);
    const isUnordered = /^[-*•]\s+/.test(line);

    if (isOrdered || isUnordered) {
      const currentType = isOrdered ? "ol" : "ul";
      if (!inList) {
        inList = true;
        listType = currentType;
        contentHtml += `<${listType}>`;
      } else if (listType !== currentType) {
        contentHtml += `</${listType}><${currentType}>`;
        listType = currentType;
      }
      const itemText = line.replace(/^\d+\.\s+|^[-*•]\s+/, "");
      contentHtml += `<li>${itemText}</li>`;
    } else {
      if (inList && listType) {
        contentHtml += `</${listType}>`;
        inList = false;
        listType = null;
      }
      contentHtml += `<p>${line}</p>`;
    }
  });

  if (inList && listType) {
    contentHtml += `</${listType}>`;
  }

  if (!contentHtml) {
    contentHtml = "<p>-</p>";
  }

  return `<h3>${title}</h3>${contentHtml}`;
}

/**
 * Combines Subjective, Objective, Assessment, and Plan text into a single HTML document.
 */
export function compileSoapToHtml(
  subjective: string,
  objective: string,
  assessment: string,
  plan: string
): string {
  return [
    sectionToHtml("Subjective (S)", subjective),
    sectionToHtml("Objective (O)", objective),
    sectionToHtml("Assessment (A)", assessment),
    sectionToHtml("Plan (P)", plan),
  ].join("");
}

/**
 * Parses the unified Tiptap HTML content back into subjective, objective, assessment, and plan fields.
 */
export function parseSoapFromHtml(html: string): {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
} {
  const result = {
    subjective: [] as string[],
    objective: [] as string[],
    assessment: [] as string[],
    plan: [] as string[],
  };

  if (typeof window === "undefined" || !html) {
    return { subjective: "", objective: "", assessment: "", plan: "" };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  let currentSection: keyof typeof result | null = null;

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toUpperCase();
      const text = el.textContent?.trim() || "";

      // Check for headings H1 - H6
      if (tagName.startsWith("H")) {
        const textLower = text.toLowerCase();
        if (textLower.includes("subjective") || textLower.match(/\b\(s\)\b/) || textLower === "s") {
          currentSection = "subjective";
        } else if (textLower.includes("objective") || textLower.match(/\b\(o\)\b/) || textLower === "o") {
          currentSection = "objective";
        } else if (textLower.includes("assessment") || textLower.match(/\b\(a\)\b/) || textLower === "a") {
          currentSection = "assessment";
        } else if (textLower.includes("plan") || textLower.match(/\b\(p\)\b/) || textLower === "p") {
          currentSection = "plan";
        } else {
          // Keep content in current section if it's a sub-heading
          if (currentSection && text) {
            result[currentSection].push(text);
          }
        }
      } else {
        if (currentSection) {
          if (tagName === "UL") {
            const items = Array.from(el.querySelectorAll("li"))
              .map((li) => `- ${li.textContent?.trim() || ""}`)
              .filter(Boolean);
            result[currentSection].push(...items);
          } else if (tagName === "OL") {
            const items = Array.from(el.querySelectorAll("li"))
              .map((li, idx) => `${idx + 1}. ${li.textContent?.trim() || ""}`)
              .filter(Boolean);
            result[currentSection].push(...items);
          } else {
            if (text && text !== "-") {
              result[currentSection].push(text);
            }
          }
        }
      }
    }
  });

  return {
    subjective: result.subjective.join("\n"),
    objective: result.objective.join("\n"),
    assessment: result.assessment.join("\n"),
    plan: result.plan.join("\n"),
  };
}
