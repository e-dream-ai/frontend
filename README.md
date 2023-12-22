## Requeriments

- node 20.x.x
- pnpm 8.x.x

## Project structure

```
./src
├── api/            # Api hooks
├── components/     # Project components
├── constants/      # Project constants
├── context/        # Contexts definitions
├── hooks/          # Hooks
├── i18n/           # Translations
├── providers/      # Providers components
├── routes/         # Routes
├── schemas/        # Validation form schemas
├── types/          # Types
├── utils/          # Utils
├── App.tsx         # App component file
├── i18n.tsx        # Translations configuration
└── index.ts        # Index App
```

## Run locally

Copy env file, replace data with correct environment info

```bash
cp .env.example .env
```

Install all packages

```bash
pnpm install
```

Then you can run:

### `pnpm run dev`

Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Build

### `pnpm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Deployment process

### Stage

- When you merge a change from a branch feat/name or fix/name to stage, or push changes directly to stage a deploy review on netlify. Only owners might deploy directly without permissions.
- To trigger a deploy on netlify, go to netlify dashboard and find stage app > **deploys** on sidemenu, find **trigger deploy** > **deploy site**
- Deploy will be trigger, wait for the build and deploy should be done.

### Production

- When you merge a change from stage branch to production brach (**main**), or push changes directly to production (**main**) a deploy review will be created on netlify. Only owners might deploy directly without permissions.
- To trigger a deploy to production (**main**) on netlify, go to netlify dashboard and find stage app > **deploys** on sidemenu, find **trigger deploy** > **deploy site**
- Deploy will be trigger, wait for the build and deploy should be done.
