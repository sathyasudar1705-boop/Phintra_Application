# Gmail Add-on Setup & Deployment

This add-on allows employees to report suspicious phishing emails directly from Gmail to the Phintra Admin Portal.

## Deployment Steps

1. Go to [Google Apps Script](https://script.google.com/) and create a new project.
2. Replace the contents of the default `Code.gs` with the code in `Code.js`.
3. In the Apps Script project settings, check "Show 'appsscript.json' manifest file in editor".
4. Copy the contents of `appsscript.json` from this folder into the Apps Script project's `appsscript.json`.
5. Save the files.
6. Click **Deploy > Test deployments**.
7. Install the test deployment in your Gmail account.
8. Set the appropriate API endpoint in the App Script code pointing to your running Phintra backend (`/api/gmail/report`).
