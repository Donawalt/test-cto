import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'desk',
  title: 'Content Desk',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    deskTool(),
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items(S.documentTypeListItems()),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
