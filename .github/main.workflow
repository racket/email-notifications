workflow "Publish to SNS topic on push" {
  on = "push"
  resolves = ["Publish"]
}

action "EmailMessage" {
  uses = "racket/email-notifications/generate-email-message@master"
}

action "Publish" {
  needs = ["EmailMessage"]
  uses = "actions/aws/cli@master"
  args = "ses send-email --from $FROM_EMAIL --to $TO_EMAIL --subject file:///github/home/EmailMessage.Subject.txt --text file:///github/home/EmailMessage.Body.txt"
  secrets = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
  env = {
    FROM_EMAIL = "commit-notifications@racket-lang.org"
    TO_EMAIL = "committers@racket-lang.org"
  }
}
