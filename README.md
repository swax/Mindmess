## Mindmess

Your mind is a mess. Get your notes organized with ChatGPT. 

### Use Cases
- You have similar, but different notes on a particular topic all over the place. 
  - Use Mindmess to iteratively merge them into a single document. 
- You're working on a system architecture or database schema. 
  - Go back and forth with the AI, modifying the schema, asking it for things you might of missed, etc..

### Functions
- **Merge:** Merge in a block on notes with the document. AI figures how how to merge the notes in.
- **Command:** Ask the AI to perform an operation on the document. For example, "delete the last paragraph".
- **Chat:** Chat with the AI about the document. For example, "what is the last paragraph about?".

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
- Fork this repo
- Create a new app on Vercel
- Point Vercel to your repo and deploy

### Updating

- (None of the packages are set to auto-update to make it easier to prevent regressions)
- Run `ncu` to review updates
- Run `ncu -u` to update package.json
- Run `npm update` to update package-lock.json
