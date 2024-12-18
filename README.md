Filefly is a platform that connects your file-hosting providers (Google Drive, OneDrive, Dropbox) as well as other platforms (Canvas, Slack, etc.) and enables you to AI search all your files with simple prompts. Filefly buzzes through all files: text, images, videos, and more. Prompt it with images and text and get your files out in return.

- “Can you give me all of my previous tax documents?”
- “Fetch me all of my biology projects about the nervous system.”
- “Create me a study guide for my BIO 101 class.”
- “Find all the video clips I filmed in a dark hallway. I need them to edit this piece.”
- “Can you show me all of the pictures of Ava, my dog? She looks like this: [INSERT IMAGE]”

### Onboarding

1. Users sign in with providers they would like to connect (i.e. Microsoft/Dropbox/google/slack/canvas). Each provider is connected with the scopes for content access (OneDrive/Google Drive/Dropbox itself).
   1. Users may add (authenticate) multiple providers after onboarding.
   2. For each provider, users will also be able to add a secondary account, so they can search multiple accounts at once.
      1. For each provider, users will only be able to log in with the primary account associated with that provider.
      2. Users will only be able to add a primary account to a provider if that primary account is not already authenticated as another user’s primary account.
         1. For example, if you set [staff@filefly.ai](mailto:staff@filefly.ai) as your primary google account, you can set [mark@filefly.ai](mailto:mark@filefly.ai) as your secondary. Then, no other user will be able to set staff@filefly.ai as their primary google account, only as a secondary.
   3. No email authentication!!! Look at Tailscale: they do not offer email authentication. We will use one of these, it will be so so so much easier.
2. After this, users select the plan they want to use to access Filefly. There are three plans available.
   - Starter, Free: limit 1 GB & 3 providers & only text documents
   - Basic, $4.99/mo, 30 day free trial offered: limit 100 GB & all providers & all files besides audio and video
   - Pro, $14.99/mo: 2TB + all providers + API access + filefly-GPT + all files
   - Enterprise ($?): Pay-as-you-go + all access
3. They are then asked if they would like to connect any additional primary providers (i.e. Microsoft/Dropbox if they picked Google). Each provider is connected with the scopes for drive access (OneDrive/Google Drive/Dropbox itself) and email access.

   1. A provider for files locally stored on their computer will also be available.
   2. Each computer connected counts as a provider
   3. This is the only way to access iCloud Drive files since Apple offers no API.
   4. This is made possible using the Filefly relay, which offers ephemeral access

      [Filefly Relay ](https://www.notion.so/Filefly-Relay-15f9a27f9dc9811a8bf3d4eb0b687752?pvs=21)

4. Users select the provider they want to use to store new files and organized files. They will also choose files that they want to exclude. Filefly will be allowed to edit and delete files at this provider, and may need to ask for additional scopes.

5. The user will now be dismissed until we finish generating embeddings for their files (either the top 500 last edited or all of them)

   1. can either implement with a cool react loading screen or just telling them to piss off and then sending an email/push when their files are ready to search

6. For each of the files in the super-hierarchy, we must now generate the embedding and insert them into the vector database.

7. Subscribe to updates either via webhook or cronjob and update the user’s vector documents as required.

8. After we are done vectorizing each document, we bring the user back and allow them to begin prompting.

9. LLM takes in prompt and any upload images and creates a query document

### Frontends

Users will be able to interact with Filefly in one of three ways

1. Our website
2. ChatGPT GPTs
3. Raycast (SUPER productivity)

(if anthropic ever launches a GPT app store also there)

### Target Audience

People with a load of files. It needs to have a slick design and be usable by anybody regardless of technical expertise. Think of my uncle with his 10,000 documents and taking 30 minutes to find a specific one!

Also, people that have their files literally everywhere. I use Google Drive, OneDrive, & iCloud Drive all religiously and would benefit massively from some way to quickly access them all.

[Vector Database](https://www.notion.so/Vector-Database-15f9a27f9dc980ac9395fe19f43001c7?pvs=21)
