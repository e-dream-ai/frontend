## Requeriments

- node 20.x.x
- npm 9.x.x
- [heroku-22 stack](https://devcenter.heroku.com/articles/heroku-22-stack) (only for deploys, not need to install locally)

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
npm ci
```

Then you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Build and eject

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Deployment process

### Stage

- When you merge a change from a branch feat/name or fix/name to stage, or push changes directly to stage a deploy review on netlify. Only owners might deploy directly without permissions.
- To trigger a deploy on netlify, go to netlify dashboard and find stage app > **deploys** on sidemenu, find **trigger deploy** > **deploy site**
- Deploy will be trigger, wait for the build and deploy should be done.

### Production

- You can follow the same steps used in stage.
