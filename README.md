## FOR WEB 
# StackIt - Minimal Q&A Forum

StackIt is a minimal, full-stack Q&A forum designed for collaborative learning and structured knowledge sharing. It allows users to ask questions, provide answers using a rich text editor, vote on answers, accept the best answer, and manage user roles.

## Features

*   **Question & Answer System**: Users can post questions and provide detailed answers.
*   **Rich Text Editor**: Integrated rich text editor (powered by TipTap) for creating well-formatted questions and answers.
*   **Voting System**: Upvote and downvote answers to highlight helpful content.
*   **Accepted Answers**: Question authors can mark an answer as "accepted" to indicate the best solution.
*   **Tagging**: Organize questions with relevant tags for easy discovery.
*   **User Authentication**: Secure user signup and login using Firebase Authentication.
*   **Role-Based Access Control**: Supports Guest, User, and Admin roles with protected routes and API endpoints.
*   **User Profiles**: Dedicated profile pages for users and admins.
*   **Notifications**: Basic notification system for user interactions (e.g., new answers).
*   **Responsive Design**: Built with Tailwind CSS and shadcn/ui for a modern, responsive user interface.

## Technologies Used

*   **Frontend**: Next.js (App Router), React, TypeScript
*   **Styling**: Tailwind CSS, shadcn/ui
*   **Rich Text Editor**: TipTap
*   **Authentication**: Firebase Authentication (Client-side & Admin SDK for Server-side)
*   **Database**: MongoDB (with Mongoose ODM)
*   **API**: Next.js Route Handlers
*   **Deployment**: Vercel (recommended)

## Getting Started

Follow these steps to set up and run the StackIt project locally.

### 1. Clone the Repository (Conceptual)

Since you are working within the v0 environment, you can download the code directly from the v0 interface. If you were to clone it from a Git repository, you would typically use:

```bash
git clone <your-repository-url>
cd stackit
```

### 2. Install Dependencies

Navigate to the project directory and install the necessary Node.js packages:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables Setup

StackIt requires several environment variables for connecting to MongoDB and Firebase. Create a file named `.env.local` in the root of your project and add the following variables:

```env
# MongoDB Connection URI
MONGODB_URI="your_mongodb_connection_string"

# Firebase Client-side Configuration (NEXT_PUBLIC_ prefix for client-side access)
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_firebase_app_id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your_firebase_measurement_id" # Optional, for analytics

# Firebase Admin SDK Configuration (Server-side only)
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_PRIVATE_KEY="your_firebase_private_key" # IMPORTANT: Replace \\n with actual newlines
FIREBASE_CLIENT_EMAIL="your_firebase_client_email"
```

#### How to Obtain Environment Variables:

**a. MongoDB URI:**

1.  Go to [MongoDB Atlas](https://cloud.mongodb.com/).
2.  Create a new cluster or select an existing one.
3.  Go to "Database Access" under "Security" and create a new database user with a strong password.
4.  Go to "Network Access" under "Security" and add your current IP address or allow access from anywhere (for development).
5.  Go to "Database" under "Deployment", click "Connect", choose "Connect your application", select "Node.js" and your Mongoose version.
6.  Copy the connection string. Replace `<username>`, `<password>`, and `<dbname>` with your actual credentials and desired database name.

**b. Firebase Client-side Configuration (`NEXT_PUBLIC_FIREBASE_*`):**

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  Click on "Project settings" (the gear icon next to "Project overview").
4.  Under "Your apps", select your web app (or add a new one if you haven't already).
5.  Choose "Config" from the "Firebase SDK snippet" options.
6.  Copy the `firebaseConfig` object values (apiKey, authDomain, projectId, etc.) and paste them into your `.env.local` file, prefixed with `NEXT_PUBLIC_`.

**c. Firebase Admin SDK Configuration (`FIREBASE_*`):**

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  Click on "Project settings" (the gear icon).
4.  Go to the "Service accounts" tab.
5.  Click "Generate new private key" and then "Generate key". This will download a JSON file.
6.  Open the downloaded JSON file.
7.  Copy the `project_id`, `private_key`, and `client_email` values.
8.  Paste them into your `.env.local` file.
    *   **IMPORTANT for `FIREBASE_PRIVATE_KEY`**: The `private_key` in the JSON file will contain actual newline characters (`\n`). When you copy this into a single-line environment variable, these newlines might be escaped as `\\n`. You **must** ensure that `\\n` is replaced with actual newline characters (`\n`) in your environment variable setup if your deployment environment doesn't handle this automatically. For local `.env.local`, you can often just copy it as is, but be aware of this for deployment. The current `lib/firebase/admin.ts` attempts to handle this with `.replace(/\\n/g, "\n")`.

### 4. Run the Development Server

Once your environment variables are set up, you can run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be accessible at `http://localhost:3000`.

## Usage

1.  **Home Page**: Provides an overview and links to view questions or ask a new one.
2.  **Authentication**: Use the "Login / Signup" button to create an account or log in.
3.  **Ask a Question**: Navigate to `/questions/ask` (requires login) to post a new question using the rich text editor.
4.  **View Questions**: Browse all questions on the `/questions` page. Click on a question to view its details and answers.
5.  **Answer Questions**: On an individual question page, logged-in users can post answers using the rich text editor.
6.  **Vote**: Upvote or downvote answers to show their helpfulness.
7.  **Accept Answer**: If you are the author of a question, you can click the checkmark icon on an answer to mark it as accepted.
8.  **Notifications**: Check the bell icon in the navbar for new notifications related to your questions or answers.
9.  **Profile/Settings**: Access your profile and settings from the user dropdown in the navbar (features to be expanded).
10. **Admin Panel**: If your user account has the `admin` role, you can access `/admin` for administrative tasks (features to be expanded).

## Contributing

Feel free to fork the repository, open issues, and submit pull requests.

---

Enjoy using StackIt!
```
