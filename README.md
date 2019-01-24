# email-notifications
GitHub action code for email notifications.

You need to have GitHub Actions enabled (via the beta) for the account or organization that owns the repository.

This requires AWS Simple Email Service to be set up, and the two secrets listed in `.github/main.workflow` to be configured in the relevant repository. Once that's done, simply copy the `.github/main.workflow` file to the `.github` directory in a repository you want to set up.
