# save-slack-emoji

This is a rough, but working, way to export all custom emoji from a Slack
instance to a set of files.

If you want, you can then use (for example)
[`slack-emojinator`](https://github.com/smashwilson/slack-emojinator)
to upload emoji to another Slack instance.

## Instructions

1. Visit https://YOUR-SLACK-TEAM.slack.com/customize/emoji and log in.
2. Paste the `save-slack-emoji.js` script into your browser console and run it
   (or use your favorite snippet manager or a bookmarklet).  Chrome works, and
   Firefox is untested but may possibly work.  The code will prompt you to save
   the emoji list to a file like `download.sh`.
3. If the emoji list spans multiple pages, run the script once for each page
   and save each resulting script to a separate file (`download-1.sh` etc).
4. Run `bash ./download.sh`, or if there are scripts for multiple pages of
   emoji, run them all **in sequential order**. \*
5. Recommended:  Keep the emoji scripts and files in a git repository.  You can
   make a new commit with the new emoji now.

\* If you have multiple pages of custom emoji, first, question
whether everything has gotten out of hand, then something like these commands
should work to download all of them:

```sh
chmod +x download-*.sh
( i=1; while [ -f "download-$i.sh" ]; do bash "download-$i.sh" || exit 1; i=$(($i+1)); done )
```
