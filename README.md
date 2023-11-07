## Mindmess

Your mind is a mess. Get your notes organized with ChatGPT.

### Use Cases

- You have similar, but different notes on a particular topic all over the place.
  - Use Mindmess to iteratively merge them into a single document.
- You're working on a system architecture or database schema.
  - Go back and forth with the AI, modifying the schema, asking it for things you might of missed, etc..
- Merging together news fragments from multiple sources along with comments

### Functions

- **Merge:** Merge in a block on notes with the document. AI figures how how to merge the notes in.
- **Command:** Ask the AI to perform an operation on the document. For example, "delete the last paragraph".
- **Chat:** Chat with the AI about the document. For example, "what is the last paragraph about?".

### Features

- **Model Selection:** Choose from a variety of OpenAI GPT models
- **Spend Tracking:** Mindmess tallies up how much you've spent so far in API fees by model
- **Output Views:** Select to view your output as editable text, monospaced, or markdown

### Tech stack

- OpenAI API
- Next.js
- React
- TypeScript
- MUI

### Running Locally

- `git clone https://github.com/swax/mindmess.git`
- `npm install`
- `npm run dev`

### Running Remotely

- Fork this repo and point Vercel at it
- Or run it standalone on any VPS or cloud provider

### Updating

- Run `ncu` to review updates
- Run `ncu -u` to explicitly update package.json
- Run `npm update` to update package-lock.json
- (Packages are not set to auto-update to prevent regressions)

### Contributing

- Open an issue with your idea or intention
- Implement the change on a branch
- Create a PR with your change, so it can be reviewed and merged
- Become a collaborator and help review other ideas and PRs
