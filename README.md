# Repo Wiper

Repo Wiper is a Vite and React app that uses GitHub OAuth and the GitHub REST API to list and permanently delete repositories. GitHub access is kept server-side in an encrypted HttpOnly cookie; no personal access token is entered into or stored by the browser.

## Local setup

1. Create a GitHub OAuth App in **GitHub Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Set the authorization callback URL to `http://localhost:5173/api/auth/callback`.
3. Create `.env.local` with:

```env
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
GITHUB_REDIRECT_URI=http://localhost:5173/api/auth/callback
APP_URL=http://localhost:5173
SESSION_SECRET=use-a-long-random-value
```

4. Run `npm install` and `npm run dev`.

The Vite development server does not execute Vercel API routes. Use `vercel dev` for local OAuth testing, or deploy to Vercel and test there.

## Vercel deployment

1. Import this repository into Vercel.
2. Add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI`, `APP_URL`, and `SESSION_SECRET` as production environment variables.
3. Set `APP_URL` to the deployed HTTPS URL and `GITHUB_REDIRECT_URI` to `${APP_URL}/api/auth/callback`.
4. Add that exact callback URL to the GitHub OAuth App.
5. Redeploy after saving the variables.

The OAuth scope includes `read:user`, `repo`, and `delete_repo` because the app lists private repositories and deletes repositories. GitHub shows the requested permissions to the user during authorization.

## GitHub Developer Program

Joining the GitHub Developer Program is separate from OAuth authentication. Apply through the [GitHub Developer Program documentation](https://docs.github.com/developers/overview/github-developer-program). The app should have a clear privacy policy, explain that deletion is irreversible, and avoid retaining GitHub data longer than necessary.
