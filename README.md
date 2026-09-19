# RepoWiper

RepoWiper is a GitHub repository management tool. It lets you sign in with GitHub, review your repositories, search and sort them, select multiple repositories, and permanently delete the selected repositories from one focused interface.

## How it works

RepoWiper uses GitHub OAuth and the GitHub REST API. Users never paste a personal access token into the browser. The OAuth credential is exchanged by the server and stored in an encrypted HttpOnly session cookie. GitHub API requests are made through the server-side Vercel functions.

The application includes:

- GitHub OAuth sign-in
- Public and private repository listing
- Repository search and sorting
- Multi-select repository management
- Permanent repository deletion with confirmation
- Dark responsive interface

## Technology

- React and TypeScript
- Vite
- Tailwind CSS
- NextUI components
- GitHub REST API
- Vercel serverless functions

## Local setup

Create a GitHub OAuth App from **GitHub Settings**, then open **Developer settings**, **OAuth Apps**, and **New OAuth App**. For local testing, use this callback URL:

```text
http://localhost:3000/api/auth/callback
```

Create a `.env.local` file in the project root:

```env
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback
APP_URL=http://localhost:3000
SESSION_SECRET=your_long_random_secret
```

Install dependencies:

```powershell
npm install
```

The frontend-only Vite server does not execute the Vercel API routes. Use the Vercel development server when testing OAuth locally:

```powershell
npm install -g vercel
vercel login
vercel link
vercel dev
```

## Vercel deployment

1. Import the repository into Vercel.
2. Deploy once to receive the Vercel domain.
3. Add the exact production callback URL to the GitHub OAuth App:

   ```text
   https://your-project.vercel.app/api/auth/callback
   ```

4. Add these Production environment variables in **Vercel Project Settings, under Environment Variables**:

   ```env
   GITHUB_CLIENT_ID=your_github_oauth_client_id
   GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
   GITHUB_REDIRECT_URI=https://your-project.vercel.app/api/auth/callback
   APP_URL=https://your-project.vercel.app
   SESSION_SECRET=your_long_random_secret
   ```

5. Redeploy after saving the variables.

The OAuth scope includes `read:user`, `repo`, and `delete_repo` so RepoWiper can identify the user, list private repositories, and delete repositories. Deletion is permanent, so test with a disposable repository first.

## GitHub Developer Program

RepoWiper qualifies as a GitHub API integration project. The GitHub Developer Program is separate from OAuth authentication. You can apply through the [GitHub Developer Program documentation](https://docs.github.com/en/integrations/concepts/github-developer-program). GitHub describes the program as open to individual developers and companies with an integration in development or production and a support contact email.
