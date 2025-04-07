# GitHub User Profile Analyzer

A React application that analyzes GitHub user profiles, displaying their repositories and commit activity.

## Features

- Search for GitHub users by username
- View user profile information
- List of public repositories with stars, forks, and language information
- Visual representation of daily commit activity

## Tech Stack

- React
- TypeScript
- ShadCN UI Components

## Prerequisites

- Node.js (v16+)
- npm or yarn

## Setup and Installation

1. Clone this repository:
   ```
   git clone https://github.com/Simran903/Briahsoft_assignment.git
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Set up ShadCN UI components:
   ```
   npx shadcn@latest init
   ```
   
   Follow the prompts to set up ShadCN UI. When asked which components to install, select:
   - card
   - input
   - button
   - tabs
   - alert

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`


## GitHub API Rate Limiting

Please note that the GitHub API has rate limits. The application uses public endpoints with a limit of 60 requests per hour for unauthenticated requests. 

For a production application, you should implement:
1. GitHub OAuth authentication to increase rate limits
2. Caching of API responses
3. More efficient API request patterns

## Known Limitations

- The commits chart currently displays mock data for demonstration purposes
- Limited to 100 repositories per user due to GitHub API pagination
