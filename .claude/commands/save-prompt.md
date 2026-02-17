Save the most recent refined prompt (or $ARGUMENTS if provided) to the SSD library for future reuse.

Steps:
1. If $ARGUMENTS is provided, use that as the prompt to save. Otherwise, find the most recently refined prompt from this conversation.
2. Ask for a short name and relevant tags (e.g., "code-review", "summarize", "debug").
3. Save to `/media/tony/studios-d-e/forge/library/prompts/` as a markdown file named after the prompt.
4. Update `/media/tony/studios-d-e/forge/library/catalog.json` with the new entry under the "prompts" array, including: name, path, description, tags, and date added.
5. Confirm: "Saved prompt '[name]' to library. Tags: [tags]."

If the SSD is not mounted, save to `docs/reference/saved-prompts.md` in the current project instead and note that it should be moved to the library later.
