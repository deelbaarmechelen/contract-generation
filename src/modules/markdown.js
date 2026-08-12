/**
 * A deliberately small markdown renderer, just enough for the contract terms in
 * voorwaarden.md. It is not a general markdown implementation: it supports the
 * handful of constructs documented at the top of that file (headings, nested
 * bullet lists, bold, and plain paragraphs).
 *
 * Text is inserted as text, never as HTML, so nothing in the markdown file can
 * inject markup into the contract.
 */

/** Escapes text so it can be safely placed in the document. */
function escapeHtml(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

/** Applies inline formatting. Only **bold** is supported. */
function renderInline(text) {
	return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}

/** Strips HTML comments, which the terms file uses for editing instructions. */
function stripComments(markdown) {
	return markdown.replace(/<!--[\s\S]*?-->/g, "");
}

/** Parses the bullet lines into a tree of { text, children } nodes, so nesting
 * is decided before any HTML is produced. Building a flat string while guessing
 * where tags belong is what makes hand-written renderers emit malformed markup. */
function renderList(items) {
	const parts = ["<ul>"];
	for (const item of items) {
		parts.push(`<li>${renderInline(item.text)}`);
		if (item.children.length > 0) {
			parts.push(renderList(item.children));
		}
		parts.push("</li>");
	}
	parts.push("</ul>");
	return parts.join("\n");
}

/** Converts the supported subset of markdown to an HTML string. */
export function renderMarkdown(markdown) {
	const lines = stripComments(markdown).split(/\r?\n/);
	const html = [];

	// Bullets are collected into a tree and only rendered once the list ends.
	let pending = [];

	function flushList() {
		if (pending.length > 0) {
			html.push(renderList(pending));
			pending = [];
		}
	}

	function addItem(depth, text) {
		let siblings = pending;
		// Walk down to the requested depth, following the most recent item at
		// each level. Indentation that skips a level simply nests as deep as it can.
		for (let level = 1; level < depth; level++) {
			if (siblings.length === 0) {
				break;
			}
			siblings = siblings[siblings.length - 1].children;
		}
		siblings.push({ text, children: [] });
	}

	for (const rawLine of lines) {
		const line = rawLine.trimEnd();

		if (line.trim().length === 0) {
			continue;
		}

		const heading = line.match(/^(#{1,6})\s+(.*)$/);
		if (heading) {
			flushList();
			const level = heading[1].length;
			html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
			continue;
		}

		const bullet = line.match(/^(\s*)-\s+(.*)$/);
		if (bullet) {
			// Two spaces of indentation per nesting level.
			addItem(Math.floor(bullet[1].length / 2) + 1, bullet[2]);
			continue;
		}

		flushList();
		html.push(`<p>${renderInline(line.trim())}</p>`);
	}

	flushList();
	return html.join("\n");
}

/** Fills every element carrying a data-markdown attribute with the rendered
 * contents of the markdown file it names. */
export async function fillMarkdownSections() {
	const elements = document.querySelectorAll("[data-markdown]");

	for (const el of elements) {
		const source = el.getAttribute("data-markdown");
		try {
			const response = await fetch(source);
			if (!response.ok) {
				throw new Error(`${response.status} ${response.statusText}`);
			}
			el.innerHTML = renderMarkdown(await response.text());
		} catch (error) {
			console.error(`Could not load markdown file "${source}":`, error);
			throw new Error(`Kon het tekstbestand "${source}" niet laden.`, { cause: error });
		}
	}
}
